import {
  Award,
  Calendar,
  Cake,
  Edit2,
  ExternalLink,
  GraduationCap,
  Lock,
  Mail,
  MessageSquare,
  Plus,
  Share2,
  User,
  Users,
  ChevronRight,
  ArrowRight,
  ChevronLeft,
  Camera,
  Upload,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal";
import AlertModal from "../../components/common/AlertModal";
import { useAlert } from "../../hooks/useAlert";
import usePortalStore from "../../store/usePortalStore";
import type { Birthday, BirthDayType, ModuleId } from "../../types/portal";
import { getCasualName } from "../../utils/nameUtils";
import { useAvatarWithEdit } from "../../hooks/useAvatar";
import Avatar from "../../components/common/Avatar";
import { fetchStatic } from "../../api/filesApi";
import { getProfileByEid, suggestEmployees, updateProfileByEid } from "../../api/profileApi";
import type { UserProfile } from "../../types/portal";

interface HomeModuleProps {
  onNavigate: (moduleId: ModuleId) => void;
  profileEid?: string;
}

type BirthdayFilter = "today" | "week" | "month";
const birthdayOptions: BirthdayFilter[] = ["today", "week", "month"];
const birthdayLabels: Record<BirthdayFilter, string> = {
  today: "Сегодня",
  week: "Текущая неделя",
  month: "Текущий месяц",
};

const HomeModule = ({ onNavigate, profileEid }: HomeModuleProps) => {
  const { alertState, showAlert, closeAlert } = useAlert();
  const navigate = useNavigate();
  const [birthdayFilter, setBirthdayFilter] = useState<BirthdayFilter>("week");
  const [selectedPerson, setSelectedPerson] = useState<Birthday | null>(null);
  const [editingField, setEditingField] = useState<{ section: string; field?: string; index?: number } | null>(null);
  const [editingValues, setEditingValues] = useState<any>({});
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [externalProfile, setExternalProfile] = useState<UserProfile | null>(null);
  const [externalProfileLoading, setExternalProfileLoading] = useState(false);
  const [externalProfileError, setExternalProfileError] = useState<string | null>(null);
  const [externalAvatarUrl, setExternalAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { avatarUrl, isLoading: avatarLoading, error: avatarError, deleteAvatar, updateAvatar } = useAvatarWithEdit();

  const startEditing = (section: string, field?: string, currentValue?: any, index?: number) => {
    setEditingField({ section, field, index });
    setEditingValues(currentValue || {});
  };

  const saveEditing = async () => { // тут обработку ошибок бы сделать
    if (!user) return;
    const updates: any = {}; // Используем any, так как projects отправляются без id (ProfileProjectUpdate[])

    if (editingField?.section === 'profile') {
      Object.assign(updates, editingValues);
    } else if (editingField?.section === 'projects') {
      const currentProjects = user.projects || [];
      if (editingField.field === 'add') {
        // Новые проекты отправляем без id, так как API сам создаст id
        const { id, ...projectData } = editingValues;
        const projectsToSend = [...currentProjects.map(p => {
          const { id, ...rest } = p;
          return rest;
        }), projectData];
        updates.projects = projectsToSend;
      } else if (editingField.index !== undefined) {
        // При обновлении отправляем все проекты без id
        const updatedProjects = [...currentProjects];
        updatedProjects[editingField.index] = { ...updatedProjects[editingField.index], ...editingValues };
        updates.projects = updatedProjects.map(p => {
          const { id, ...rest } = p;
          return rest;
        });
      }
    } else if (editingField?.section === 'vacations') {
      const currentVacations = user.vacations || [];
      if (currentVacations.length > 0) {
        const updatedVacations = [...currentVacations];
        updatedVacations[0] = { ...updatedVacations[0], ...editingValues };
        updates.vacations = updatedVacations;
      }
    }

    if (isForeignProfile && isHr) {
      const response = await updateProfileByEid(String(user.eid), updates);
      if (response.status >= 200 && response.status < 300 && response.data) {
        setExternalProfile(response.data);
      }
    } else if (currentUser) {
      await updateCurrentUser(currentUser.eid, updates);
    }

    setEditingField(null);
  };

  const cancelEditing = () => {
    setEditingField(null);
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      showAlert('Пожалуйста, выберите файл изображения', 'warning');
      return;
    }

    // Проверка размера файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Размер файла не должен превышать 5MB', 'warning');
      return;
    }

    const success = await updateAvatar(file);
    if (success) {
      setShowAvatarModal(false);
    }

    // Очищаем input для возможности повторной загрузки того же файла
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    const confirmed = window.confirm('Вы уверены, что хотите удалить аватар?');
    if (!confirmed) return;

    const success = await deleteAvatar();
    if (success) {
      setShowAvatarModal(false);
    }
  };

  const {
    currentUser,
    upcomingBirthdays,
    calendarEvents,
    courses,
    loading,
    updateCurrentUser,
    fetchBirthdays,
    roles,
    organizationHierarchy,
    employees,
  } = usePortalStore();

  const isForeignProfile = Boolean(
    profileEid && currentUser && String(profileEid) !== String(currentUser.eid)
  );

  useEffect(() => {
    const loadExternalProfile = async () => {
      if (!profileEid || !currentUser || !isForeignProfile) {
        setExternalProfile(null);
        setExternalProfileError(null);
        return;
      }

      setExternalProfileLoading(true);
      setExternalProfileError(null);

      try {
        const response = await getProfileByEid(profileEid);
        if (response.status >= 200 && response.status < 300 && response.data) {
          setExternalProfile(response.data);
        } else {
          setExternalProfile(null);
          setExternalProfileError(response.message || "Не удалось загрузить профиль сотрудника");
        }
      } catch (error) {
        console.error("Failed to load external profile:", error);
        setExternalProfile(null);
        setExternalProfileError("Не удалось загрузить профиль сотрудника");
      } finally {
        setExternalProfileLoading(false);
      }
    };

    loadExternalProfile();
  }, [profileEid, currentUser, isForeignProfile]);

  useEffect(() => {
    const loadExternalAvatar = async () => {
      if (!isForeignProfile || !externalProfile?.avatar_id) {
        setExternalAvatarUrl(null);
        return;
      }

      const response = await fetchStatic(externalProfile.avatar_id);
      if (response.status === 200 && response.data) {
        setExternalAvatarUrl(response.data);
      } else {
        setExternalAvatarUrl(null);
      }
    };

    loadExternalAvatar();
  }, [isForeignProfile, externalProfile?.avatar_id]);

  const isHr = roles.includes("hr");
  const canEditOwnProfileFields = isHr;

  const user = isForeignProfile ? externalProfile : currentUser;
  const canEditPersonalFields = isForeignProfile ? isHr : canEditOwnProfileFields;
  const canEditAvatar = !isForeignProfile && canEditPersonalFields;
  const displayedAvatarUrl = isForeignProfile ? externalAvatarUrl : avatarUrl;

  const orgUnitOptions = useMemo(() => {
    const options: { value: number; label: string }[] = [];
    const walk = (items: typeof organizationHierarchy) => {
      items.forEach((unit) => {
        options.push({ value: unit.id, label: unit.name });
        if (unit.children?.length) {
          walk(unit.children);
        }
      });
    };
    walk(organizationHierarchy || []);
    return options;
  }, [organizationHierarchy]);

  const orgUnitIdByName = useMemo(() => {
    return new Map(orgUnitOptions.map((unit) => [unit.label, unit.value]));
  }, [orgUnitOptions]);

  const employeeOptions = useMemo(() => {
    return (employees || []).map((employee) => ({
      value: String(employee.id),
      label: `${employee.full_name} — ${employee.position}`,
      name: employee.full_name,
    }));
  }, [employees]);

  const employeeIdByName = useMemo(() => {
    return new Map(employeeOptions.map((employee) => [employee.name, employee.value]));
  }, [employeeOptions]);

  // Загружаем дни рождения при изменении фильтра
  useEffect(() => {
    const timeUnit: BirthDayType = birthdayFilter === 'today' ? 'day' : birthdayFilter === 'week' ? 'week' : 'month';
    fetchBirthdays(timeUnit);
  }, [birthdayFilter, fetchBirthdays]);

  // Используем данные напрямую с сервера, так как они уже отфильтрованы
  const filteredBirthdays = useMemo(() => {
    if (!upcomingBirthdays || !Array.isArray(upcomingBirthdays)) {
      return [];
    }
    return upcomingBirthdays;
  }, [upcomingBirthdays]);


  const formatDate = (dateStr: string, mode?: string): string => {
    const date = new Date(dateStr);
    switch (mode) {
      case 'my': ;
        return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }).replace(/[.,г]/g, '').trim().replace(/^./, char => char.toUpperCase());
      case 'dm':
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' }).replace(/[.,]/g, '').trim();
    };
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const formatBirthdayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisYearBirthday = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    const daysDiff = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return 'Сегодня';
    if (daysDiff === 1) return 'Завтра';
    return thisYearBirthday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const isBirthdayToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getDate() === now.getDate() && date.getMonth() === now.getMonth();
  };

  const getVacationStatus = (vacation: any) => {
    const now = new Date();
    const start = new Date(vacation.start_date);
    const end = new Date(vacation.end_date);
    if (now >= start && now <= end) return "active";
    return "planned";
  };

  const openProfileByEid = (eid: number | string) => {
    navigate(`/profile/${eid}`);
  };

  const openProfileByName = async (fullName: string) => {
    try {
      const response = await suggestEmployees(fullName, 10);
      if (response.status >= 200 && response.status < 300 && response.data?.suggestions?.length) {
        const normalized = fullName.trim().toLowerCase();
        const exact = response.data.suggestions.find(
          (item) => item.full_name.trim().toLowerCase() === normalized
        );
        const target = exact || response.data.suggestions[0];
        openProfileByEid(target.eid);
      }
    } catch (error) {
      console.error("Не удалось открыть профиль сотрудника:", error);
    }
  };

  const structurePeople = useMemo(
    () => [
      {
        id: "manager",
        full_name: user?.manager_name,
        position: "Руководитель",
        department: user?.org_unit,
      },
      {
        id: "hrbp",
        full_name: user?.hr_name,
        position: "HR-бизнес-партнер",
        department: "HR",
      },
    ].filter((person): person is { id: string; full_name: string; position: string; department?: string | null } => Boolean(person.full_name)),
    [user?.manager_name, user?.hr_name, user?.org_unit]
  );

  const renderProfileEditor = () => {
    if (editingField?.section !== "profile" || !editingField.field) {
      return null;
    }

    switch (editingField.field) {
      case "full_name":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
            <input
              type="text"
              value={editingValues.full_name || ""}
              onChange={(e) => setEditingValues({ ...editingValues, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case "position":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
            <input
              type="text"
              value={editingValues.position || ""}
              onChange={(e) => setEditingValues({ ...editingValues, position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case "org_unit":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
            <select
              value={editingValues.org_unit_id ?? ""}
              onChange={(e) => {
                const nextValue = e.target.value ? Number(e.target.value) : null;
                const selectedUnit = orgUnitOptions.find((unit) => unit.value === nextValue);
                setEditingValues({
                  ...editingValues,
                  org_unit_id: nextValue,
                  org_unit: selectedUnit?.label || "",
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Выберите подразделение</option>
              {orgUnitOptions.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        );
      case "manager_eid":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Руководитель</label>
            <select
              value={editingValues.manager_eid || ""}
              onChange={(e) => {
                const nextValue = e.target.value || "";
                const selectedEmployee = employeeOptions.find((employee) => employee.value === nextValue);
                setEditingValues({
                  ...editingValues,
                  manager_eid: nextValue,
                  manager_name: selectedEmployee?.name || "",
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Выберите руководителя</option>
              {employeeOptions.map((employee) => (
                <option key={employee.value} value={employee.value}>
                  {employee.label}
                </option>
              ))}
            </select>
          </div>
        );
      case "hrbp_eid":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HR BP</label>
            <select
              value={editingValues.hrbp_eid || ""}
              onChange={(e) => {
                const nextValue = e.target.value || "";
                const selectedEmployee = employeeOptions.find((employee) => employee.value === nextValue);
                setEditingValues({
                  ...editingValues,
                  hrbp_eid: nextValue,
                  hr_name: selectedEmployee?.name || "",
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Выберите HR BP</option>
              {employeeOptions.map((employee) => (
                <option key={employee.value} value={employee.value}>
                  {employee.label}
                </option>
              ))}
            </select>
          </div>
        );
      case "work_phone":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Рабочий телефон</label>
            <input
              type="text"
              value={editingValues.work_phone || ""}
              onChange={(e) => setEditingValues({ ...editingValues, work_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case "work_email":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Рабочая почта</label>
            <input
              type="email"
              value={editingValues.work_email || ""}
              onChange={(e) => setEditingValues({ ...editingValues, work_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case "personal_phone":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Личный телефон</label>
            <input
              type="text"
              value={editingValues.personal_phone || ""}
              onChange={(e) => setEditingValues({ ...editingValues, personal_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case "telegram":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
            <input
              type="text"
              value={editingValues.telegram || ""}
              onChange={(e) => setEditingValues({ ...editingValues, telegram: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      case "about_me":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
            <textarea
              value={editingValues.about_me || ""}
              onChange={(e) => setEditingValues({ ...editingValues, about_me: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading || externalProfileLoading || !currentUser || !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-36"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-64"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-64"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-64"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-48"></div>
      </div>
    );
  }

  const currentVacation = user.vacations && user.vacations.length > 0 ? user.vacations[0] : null;

  return (
    <div className="space-y-6">
      {isForeignProfile && externalProfileError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {externalProfileError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              className={`relative w-20 h-20 rounded-full group ${canEditAvatar ? "cursor-pointer" : "cursor-default"}`}
              onClick={canEditAvatar ? handleAvatarClick : undefined}
            >
              <Avatar 
                avatarUrl={displayedAvatarUrl ?? undefined}
                fullName={user.full_name}
                size={20}
              />
              {canEditAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{getCasualName(user.full_name)}</h2>
                {currentVacation && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getVacationStatus(currentVacation) === "active"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-purple-600 text-white"
                      }`}
                  >
                    {getVacationStatus(currentVacation) === "active" ? "В отпуске" : "Отпуск запланирован"}
                  </span>
                )}
                <button className="p-1 hover:bg-gray-100 rounded" aria-label="Поделиться профилем">
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600">{user.position}</p>
              <p className="text-sm text-gray-500">{user.eid}</p>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Редактировать профиль
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InfoCard title="Данные профиля" icon={<User className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-3">
            <ProfileRow
              label="EID"
              value={user.eid.toString()}
              editable={false}
            />
            <ProfileRow
              label="ФИО"
              value={user.full_name}
              editable={isHr}
              onEdit={() => startEditing('profile', 'full_name', { full_name: user.full_name })}
            />
            <ProfileRow
              label="Должность"
              value={user.position}
              editable={isHr}
              onEdit={() => startEditing('profile', 'position', { position: user.position })}
            />
            <ProfileRow
              label="Подразделение"
              value={user.org_unit}
              editable={isHr}
              onEdit={() =>
                startEditing('profile', 'org_unit', {
                  org_unit: user.org_unit,
                  org_unit_id: orgUnitIdByName.get(user.org_unit) ?? null,
                })
              }
            />
            <ProfileRow
              label="Руководитель"
              value={user.manager_name || "Не указан"}
              editable={isHr}
              onEdit={() =>
                startEditing('profile', 'manager_eid', {
                  manager_name: user.manager_name || "",
                  manager_eid: user.manager_name ? employeeIdByName.get(user.manager_name) ?? "" : "",
                })
              }
            />
            <ProfileRow
              label="HR BP"
              value={user.hr_name || "Не указан"}
              editable={isHr}
              onEdit={() =>
                startEditing('profile', 'hrbp_eid', {
                  hr_name: user.hr_name || "",
                  hrbp_eid: user.hr_name ? employeeIdByName.get(user.hr_name) ?? "" : "",
                })
              }
            />
            <ProfileRow
              label="Дата рождения"
              value={formatDate(user.birth_date, 'dm')}
              editable={false}
            />
            <ProfileRow
              label="Работает в компании"
              value={`с ${formatDate(user.hire_date)}`}
              editable={false}
            />
          </div>
        </InfoCard>

        <InfoCard title="Контакты" icon={<Mail className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-3">
            <ProfileRow
              label="Личный телефон"
              value={user.personal_phone}
              editable={canEditPersonalFields}
              onEdit={() => startEditing('profile', 'personal_phone', { personal_phone: user.personal_phone })}
            />
            <ProfileRow
              label="Рабочий телефон"
              value={user.work_phone}
              editable={isHr}
              onEdit={() => startEditing('profile', 'work_phone', { work_phone: user.work_phone })}
            />
            <ProfileRow
              label="Рабочая почта"
              value={user.work_email}
              link={`mailto:${user.work_email}`}
              editable={isHr}
              onEdit={() => startEditing('profile', 'work_email', { work_email: user.work_email })}
              isSmall
            />
            <ProfileRow label="Band" value={user.work_band} editable={false} />
            <ProfileRow
              label="Telegram"
              value={user.telegram || "Не указан"}
              editable={canEditPersonalFields}
              onEdit={() => startEditing('profile', 'telegram', { telegram: user.telegram || '' })}
            />
          </div>
        </InfoCard>

        <InfoCard title="Структура" icon={<Users className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-3">
            {structurePeople.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => openProfileByName(employee.full_name)}
                className="p-2 w-full text-left hover:bg-purple-50 rounded-lg transition-colors"
              >
                <div className="flex justify-between items-center gap-3">

                  <Avatar 
                    fullName={employee.full_name}
                    size={16}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">{employee.position}</p>
                    <h3 className="font-semibold text-purple-600 hover:underline">{getCasualName(employee.full_name)}</h3>
                    <p className="text-sm text-gray-500">Департамент</p>
                    <p className="text-sm text-black">{employee.department || "Не указан"}</p>
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={() => onNavigate("structure")}
              className="mt-4 text-sm text-purple-600 hover:underline flex items-center gap-1"
            >
              Вся структура / Коллеги по отделу <ChevronRight strokeWidth={2} className="w-4 h-4" />
            </button>
          </div>
        </InfoCard>
      </div>

      <Card
        title="О себе"
        icon={<User className="w-5 h-5 text-purple-600" />}
        action={
          canEditPersonalFields ? (
            <button
              onClick={() => startEditing('profile', 'about_me', { about_me: user.about_me || '' })}
              className="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Редактировать
            </button>
          ) : null
        }
      >
        <p className="text-gray-700 leading-relaxed">{user.about_me || 'Не указано'}</p>
      </Card>

      <Card
        title="Проекты"
        icon={<Award className="w-5 h-5 text-purple-600" />}
        action={
          canEditPersonalFields ? (
            <button onClick={() => startEditing('projects', 'add', {})} className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Добавить проект
            </button>
          ) : null
        }
      >
        <div className="space-y-3">
          {(user.projects || []).map((project) => (
            <div key={project.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{project.name || 'Без названия'}</h4>
                <div className="flex gap-2">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {/* <button onClick={() => startEditing('projects', undefined, project, index)} className="p-1 hover:bg-gray-100 rounded">
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button> */}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{project.position || 'Не указана'}</p>
              <p className="text-xs text-gray-500">
                {project.start_d ? formatDate(project.start_d, 'my') : 'Не указано'} - {project.end_d ? formatDate(project.end_d, 'my') : "настоящее время"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {currentVacation && (
            <Card
              title="Отпуск"
              icon={<Calendar className="w-5 h-5 text-purple-600" />}
              status={<span className={`px-3 py-1 text-sm font-medium rounded-full ${getVacationStatus(currentVacation) === "active" ? "bg-orange-100 text-orange-700" : "bg-purple-600 text-white"}`}>{getVacationStatus(currentVacation) === "active" ? "В отпуске" : "Планируется"} </span>}
              action={
                canEditPersonalFields ? (
                  <button onClick={() => startEditing('vacations', undefined, currentVacation)} className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1"><ArrowRight strokeWidth={1.5} className="w-4 h-4" /> Отправить заявку</button>
                ) : null
              }>
              <div className="space-y-4">
                <div className="flex items-center justify-between px-5 py-4 bg-purple-50 rounded-lg">
                  <VacationInfo label="Дата начала" value={formatDate(currentVacation.start_date)} />
                  {currentVacation.substitute && (
                    <StructureLink label="Замещение" value={currentVacation.substitute} />
                  )}
                </div>

                <div className="flex items-center justify-between px-5 py-4 bg-purple-50 rounded-lg">
                  <VacationInfo label="Дата окончания" value={formatDate(currentVacation.end_date)} />
                  {currentVacation.comment && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Комментарий</p>
                      <p className="text-gray-700">{currentVacation.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
          <Card title="Ближайшие события" icon={<Calendar className="w-5 h-5 text-purple-600" />}>
            <div className="space-y-3">
              {calendarEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <p className="font-medium text-gray-900 mb-1">{event.title}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{event.date}</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate("calendar")} className="mt-4 text-sm text-purple-600 hover:underline">
              Смотреть все события →
            </button>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Ближайшие дни рождения" icon={<Cake className="w-5 h-5 text-purple-600" />} action={filterSwitch({ options: birthdayOptions, labels: birthdayLabels, filter: birthdayFilter, setFilter: setBirthdayFilter })}>
            <div className="space-y-3">
              {filteredBirthdays.length ? (
                filteredBirthdays.map((person) => (
                  <div
                    key={person.eid}
                    className={`flex items-center justify-between p-3 rounded-lg ${isBirthdayToday(person.birth_date) ? "bg-purple-500" : "bg-purple-50"}`}
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => openProfileByEid(person.eid)}
                        className={`font-medium ${isBirthdayToday(person.birth_date) ? "text-white" : "text-gray-900"} hover:underline`}
                      >
                        {person.full_name}
                      </button>
                      <p className={`text-sm ${isBirthdayToday(person.birth_date) ? "text-white" : "text-gray-600"}`}>{person.org_unit}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isBirthdayToday(person.birth_date) ? "text-white" : "text-purple-600"}`}>{formatBirthdayDate(person.birth_date)}</p>
                      <button
                        onClick={() => setSelectedPerson(person)}
                        className={`text-xs ${isBirthdayToday(person.birth_date) ? "text-white" : "text-purple-600"} hover:underline mt-1`}
                      >
                        Поздравить
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Нет дней рождения в выбранном периоде</p>
              )}
            </div>
          </Card>

          <Card title="Моё обучение" icon={<GraduationCap className="w-5 h-5 text-purple-600" />}>
            <div className="space-y-3">
              {courses
                .filter((course) => course.status !== "completed")
                .slice(0, 2)
                .map((course) => (
                  <div key={course.id} className="p-3 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">{course.title}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{course.progress}%</span>
                    </div>
                  </div>
                ))}
            </div>
            <button onClick={() => onNavigate("training")} className="mt-4 text-sm text-purple-600 hover:underline">
              Все курсы →
            </button>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedPerson)}
        title="Поздравить коллегу"
        onClose={() => setSelectedPerson(null)}
        widthClass="max-w-md"
      >
        {selectedPerson && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {selectedPerson.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedPerson.full_name}</p>
                <p className="text-sm text-gray-600">{selectedPerson.org_unit}</p>
                <p className="text-sm text-purple-600 font-medium">{formatBirthdayDate(selectedPerson.birth_date)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Выберите способ отправки поздравления:</p>
            <div className="space-y-3">
              {["Через портал", "По электронной почте", "Через Band"].map((option) => (
                <button
                  key={option}
                  className="w-full flex items-center gap-3 p-3 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{option}</p>
                    <p className="text-xs text-gray-600">Отправить поздравление выбранным способом</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedPerson(null)}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(editingField)}
        title={`Редактировать ${editingField?.field || editingField?.section}`}
        onClose={cancelEditing}
        widthClass="max-w-md"
      >
        {editingField && (
          <div className="space-y-4">
            {renderProfileEditor()}
            {(editingField.section === 'projects' && editingField.field === 'add') || (editingField.section === 'projects' && editingField.index !== undefined) && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название проекта</label>
                  <input
                    type="text"
                    value={editingValues.name || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
                  <input
                    type="text"
                    value={editingValues.position || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                  <input
                    type="date"
                    value={editingValues.start_d || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, start_d: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
                  <input
                    type="date"
                    value={editingValues.end_d || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, end_d: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка</label>
                  <input
                    type="text"
                    value={editingValues.link || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
            {editingField.section === 'vacations' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                  <input
                    type="date"
                    value={editingValues.start_date || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
                  <input
                    type="date"
                    value={editingValues.end_date || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Замещение</label>
                  <input
                    type="text"
                    value={editingValues.substitute || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, substitute: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
                  <textarea
                    value={editingValues.comment || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, comment: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={saveEditing} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Сохранить
              </button>
              <button onClick={cancelEditing} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showAvatarModal}
        title="Управление фотографией профиля"
        onClose={() => setShowAvatarModal(false)}
        widthClass="max-w-md"
      >
        <div className="space-y-4">
          {avatarUrl && (
            <div className="flex justify-center">
              <img
                src={avatarUrl}
                alt="Текущая фотография"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          )}
          
          {avatarError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {avatarError}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {avatarUrl ? 'Изменить фотографию' : 'Загрузить фотографию'}
            </button>

            {avatarUrl && (
              <button
                onClick={handleDeleteAvatar}
                disabled={avatarLoading}
                className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Удалить фотографию
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Рекомендуемый размер: 200x200 пикселей. Максимальный размер файла: 5MB
          </p>

          <button
            onClick={() => setShowAvatarModal(false)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Закрыть
          </button>
        </div>
      </Modal>
      <AlertModal {...alertState} onClose={closeAlert} />
    </div>
  );
};

const InfoCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      {icon}
      {title}
    </h3>
    {children}
  </div>
);

const Card = ({
  title,
  status,
  icon,
  children,
  action,
}: {
  title: string;
  status?: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 pb-12">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {icon}
        {title}
        {status}
      </h3>
      {action}
    </div>
    {children}
  </div>
);

const ProfileRow = ({
  label,
  value,
  secure,
  helper,
  isSmall,
  link,
  editable,
  onEdit,
}: {
  label: string;
  value: string;
  secure?: boolean;
  helper?: string;
  isSmall?: boolean;
  link?: string;
  editable?: boolean;
  onEdit?: () => void;
}) => {
  const Tag: React.ElementType = link ? "a" : "p";
  return (
    <div className="space-y-0.5">
      <p className="text-sm text-gray-500">{label}</p>
      <Tag className={`font-medium flex items-center gap-2 ${isSmall ? "text-sm" : ""} ${link ? "text-purple-600 hover:underline" : ""}`} href={link}>
        {value}
        {editable ? (
          <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded">
            <Edit2 className="w-3 h-3 text-gray-500" />
          </button>
        ) : (
          secure && <Lock className="w-3 h-3 text-gray-400" />
        )}
      </Tag>
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

const StructureLink = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <button className="font-medium text-purple-600 hover:underline">{value}</button>
  </div>
);

const VacationInfo = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

type FilterSwitchProps<T extends string> = {
  options: readonly T[];
  labels: Record<T, string>;
  filter: T;
  setFilter: (value: T) => void;
};

const filterSwitch = <T extends string>({
  options,
  labels,
  filter,
  setFilter,
}: FilterSwitchProps<T>) => {
  const index = options.indexOf(filter);

  const prev = () => {
    if (index > 0) {
      setFilter(options[index - 1]);
    }
  };

  const next = () => {
    if (index < options.length - 1) {
      setFilter(options[index + 1]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        disabled={index === 0}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg bg-white whitespace-nowrap">
        {labels[filter]}
      </div>

      <button
        onClick={next}
        disabled={index === options.length - 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};


export default HomeModule;
