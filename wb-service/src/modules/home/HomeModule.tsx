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
} from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import type { Birthday, ModuleId } from "../../types/portal";
import { editableFields } from "../../types/portal";

interface HomeModuleProps {
  onNavigate: (moduleId: ModuleId) => void;
}

type BirthdayFilter = "today" | "week" | "month";

const HomeModule = ({ onNavigate }: HomeModuleProps) => {
  const [birthdayFilter, setBirthdayFilter] = useState<BirthdayFilter>("week");
  const [selectedPerson, setSelectedPerson] = useState<Birthday | null>(null);
  const [editingField, setEditingField] = useState<{ section: string; field?: string; index?: number } | null>(null);
  const [editingValues, setEditingValues] = useState<any>({});

  const startEditing = (section: string, field?: string, currentValue?: any, index?: number) => {
    setEditingField({ section, field, index });
    setEditingValues(currentValue || {});
  };

  const saveEditing = () => {
    if (!currentUser) return;
    if (editingField?.section === 'profile') {
      updateCurrentUser({
        profile: { ...currentUser.profile, ...editingValues }
      });
    } else if (editingField?.section === 'projects') {
      if (editingField.field === 'add') {
        const newProject = { ...editingValues, id: currentUser.projects.length + 1 };
        updateCurrentUser({
          projects: [...currentUser.projects, newProject]
        });
      } else if (editingField.index !== undefined) {
        const updatedProjects = [...currentUser.projects];
        updatedProjects[editingField.index] = { ...updatedProjects[editingField.index], ...editingValues };
        updateCurrentUser({
          projects: updatedProjects
        });
      }
    } else if (editingField?.section === 'vacations') {
      updateCurrentUser({
        vacations: currentUser.vacations.map((v, i) => i === 0 ? { ...v, ...editingValues } : v)
      });
    }
    setEditingField(null);
  };

  const cancelEditing = () => {
    setEditingField(null);
  };
  const { currentUser, upcomingBirthdays, calendarEvents, courses, employees, loading, updateCurrentUser } = usePortalStore();

  const filteredBirthdays = useMemo(() => {
    return upcomingBirthdays.filter((person) => {
      if (birthdayFilter === "today") {
        return person.period === "today";
      }
      if (birthdayFilter === "week") {
        return person.period === "today" || person.period === "week";
      }
      return true;
    });
  }, [upcomingBirthdays, birthdayFilter]);

  const getEmployeeNameById = (id: number | null) => {
    if (!id) return null;
    const emp = employees.find(e => e.id === id);
    return emp ? emp.full_name : null;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getVacationStatus = (vacation: any) => {
    const now = new Date();
    const start = new Date(vacation.start_date);
    const end = new Date(vacation.end_date);
    if (now >= start && now <= end) return "active";
    return "planned";
  };

  if (loading || !currentUser) {
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

  const user = currentUser;
  const currentVacation = user.vacations[0];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.employee.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.employee.full_name}</h2>
                {currentVacation && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      getVacationStatus(currentVacation) === "active"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {getVacationStatus(currentVacation) === "active" ? "В отпуске" : "Отпуск запланирован"}
                  </span>
                )}
                <button className="p-1 hover:bg-gray-100 rounded" aria-label="Поделиться профилем">
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600">{user.employee.position}</p>
              <p className="text-sm text-gray-500">EID: {user.employee.id}</p>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Редактировать
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InfoCard title="Данные профиля" icon={<User className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-3">
            <ProfileRow label="EID" value={user.employee.id.toString()} editable={editableFields.employee.id} />
            <ProfileRow label="Должность" value={user.employee.position} editable={editableFields.employee.position} />
            <ProfileRow label="Департамент" value={user.department?.name || ""} editable={false} />
            <ProfileRow label="Дата рождения" value={formatDate(user.employee.birth_date)} editable={editableFields.employee.birth_date} />
            <ProfileRow label="Работает в компании" value={`с ${formatDate(user.employee.hire_date)}`} editable={editableFields.employee.hire_date} />
          </div>
        </InfoCard>

        <InfoCard title="Контакты" icon={<Mail className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-3">
            <ProfileRow label="Личный телефон" value={user.profile.personal_phone} editable={editableFields.profile.personal_phone} onEdit={() => startEditing('profile', 'personal_phone', { personal_phone: user.profile.personal_phone })} />
            <ProfileRow label="Рабочий телефон" value={user.employee.work_phone} editable={editableFields.employee.work_phone} />
            <ProfileRow label="Рабочая почта" value={user.employee.work_email} editable={editableFields.employee.work_email} isSmall />
            <ProfileRow label="Band" value={user.employee.work_band} editable={editableFields.employee.work_band} />
            <ProfileRow label="Telegram" value={user.profile.telegram || "Не указан"} editable={editableFields.profile.telegram} onEdit={() => startEditing('profile', 'telegram', { telegram: user.profile.telegram || '' })} />
          </div>
        </InfoCard>

        <InfoCard title="Структура" icon={<Users className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-3">
            <StructureLink label="Руководитель" value={user.manager?.full_name || ""} />
            <StructureLink label="HR-бизнес-партнёр" value={user.hrbp?.full_name || ""} />
            <button
              onClick={() => onNavigate("structure")}
              className="mt-4 text-sm text-purple-600 hover:underline flex items-center gap-1"
            >
              Вся структура / Коллеги по отделу
            </button>
          </div>
        </InfoCard>
      </div>

      <Card title="О себе" icon={<User className="w-5 h-5 text-purple-600" />} action={<button onClick={() => startEditing('profile', 'about_me', { about_me: user.profile.about_me })} className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1"><Edit2 className="w-4 h-4" /> Редактировать</button>}>
        <p className="text-gray-700 leading-relaxed">{user.profile.about_me}</p>
      </Card>

      <Card
        title="Проекты"
        icon={<Award className="w-5 h-5 text-purple-600" />}
        action={
          <button onClick={() => startEditing('projects', 'add', {})} className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Добавить проект
          </button>
        }
      >
        <div className="space-y-3">
          {user.projects.map((project, index) => (
            <div key={project.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{project.name}</h4>
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
                  <button onClick={() => startEditing('projects', undefined, project, index)} className="p-1 hover:bg-gray-100 rounded">
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{project.position}</p>
              <p className="text-xs text-gray-500">
                {formatDate(project.start_d)} - {project.end_d ? formatDate(project.end_d) : "настоящее время"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {currentVacation && (
        <Card title="Отпуск" icon={<Calendar className="w-5 h-5 text-purple-600" />} action={<button onClick={() => startEditing('vacations', undefined, currentVacation)} className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1"><Edit2 className="w-4 h-4" /> Редактировать</button>}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">Статус:</p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  getVacationStatus(currentVacation) === "active"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {getVacationStatus(currentVacation) === "active" ? "В отпуске" : "Планируется"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <VacationInfo label="Дата начала" value={formatDate(currentVacation.start_date)} />
              <VacationInfo label="Дата окончания" value={formatDate(currentVacation.end_date)} />
            </div>
            {currentVacation.substitute_eid && (
              <StructureLink label="Замещение" value={getEmployeeNameById(currentVacation.substitute_eid) || ""} />
            )}
            {currentVacation.comment && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Комментарий</p>
                <p className="text-gray-700">{currentVacation.comment}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card title="Ближайшие дни рождения" icon={<Cake className="w-5 h-5 text-purple-600" />}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">Поздравьте коллег вовремя</p>
          <select
            value={birthdayFilter}
            onChange={(event) => setBirthdayFilter(event.target.value as BirthdayFilter)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="today">Сегодня</option>
            <option value="week">Текущая неделя</option>
            <option value="month">Текущий месяц</option>
          </select>
        </div>
        <div className="space-y-3">
          {filteredBirthdays.length ? (
            filteredBirthdays.map((person) => (
              <div key={person.name} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{person.name}</p>
                  <p className="text-sm text-gray-600">{person.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-600">{person.date}</p>
                  <button
                    onClick={() => setSelectedPerson(person)}
                    className="text-xs text-purple-600 hover:underline mt-1"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {selectedPerson.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedPerson.name}</p>
                <p className="text-sm text-gray-600">{selectedPerson.department}</p>
                <p className="text-sm text-purple-600 font-medium">{selectedPerson.date}</p>
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
            {editingField.section === 'profile' && editingField.field === 'personal_phone' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Личный телефон</label>
                <input
                  type="text"
                  value={editingValues.personal_phone || ''}
                  onChange={(e) => setEditingValues({ ...editingValues, personal_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
            {editingField.section === 'profile' && editingField.field === 'telegram' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                <input
                  type="text"
                  value={editingValues.telegram || ''}
                  onChange={(e) => setEditingValues({ ...editingValues, telegram: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
            {editingField.section === 'profile' && editingField.field === 'about_me' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
                <textarea
                  value={editingValues.about_me || ''}
                  onChange={(e) => setEditingValues({ ...editingValues, about_me: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Замещение (EID)</label>
                  <input
                    type="text"
                    value={editingValues.substitute_eid || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, substitute_eid: e.target.value })}
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
  icon,
  children,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {icon}
        {title}
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
  editable,
  onEdit,
}: {
  label: string;
  value: string;
  secure?: boolean;
  helper?: string;
  isSmall?: boolean;
  editable?: boolean;
  onEdit?: () => void;
}) => (
  <div className="space-y-0.5">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`font-medium flex items-center gap-2 ${isSmall ? "text-sm" : ""}`}>
      {value}
      {editable ? (
        <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded">
          <Edit2 className="w-3 h-3 text-gray-500" />
        </button>
      ) : (
        secure && <Lock className="w-3 h-3 text-gray-400" />
      )}
    </p>
    {helper && <p className="text-xs text-gray-500">{helper}</p>}
  </div>
);

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

export default HomeModule;
