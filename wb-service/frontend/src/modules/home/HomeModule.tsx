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

interface HomeModuleProps {
  onNavigate: (moduleId: ModuleId) => void;
}

type BirthdayFilter = "today" | "week" | "month";

const HomeModule = ({ onNavigate }: HomeModuleProps) => {
  const [birthdayFilter, setBirthdayFilter] = useState<BirthdayFilter>("week");
  const [selectedPerson, setSelectedPerson] = useState<Birthday | null>(null);
  const { currentUser, upcomingBirthdays, calendarEvents, courses, loading } = usePortalStore();

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                {user.vacation && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.vacation.status === "active"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.vacation.status === "active" ? "В отпуске" : "Отпуск запланирован"}
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
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Редактировать
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InfoCard title="Данные профиля" icon={<User className="w-5 h-5 text-purple-600" />}>
          <ProfileRow label="EID" value={user.eid} secure />
          <ProfileRow label="Должность" value={user.position} secure />
          <ProfileRow label="Департамент" value={user.department} secure helper={user.parentDepartment} />
          <ProfileRow label="Дата рождения" value={user.birthday} />
          <ProfileRow label="Работает в компании" value={`с ${user.startDate}`} secure />
        </InfoCard>

        <InfoCard title="Контакты" icon={<Mail className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Личный телефон</p>
              <div className="flex items-center gap-2">
                <p className="font-medium">{user.personalPhone}</p>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <Edit2 className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            </div>
            <ProfileRow label="Рабочий телефон" value={user.phone} secure />
            <ProfileRow label="Рабочая почта" value={user.email} secure isSmall />
            <ProfileRow label="Band" value={user.band} secure />
            <div>
              <p className="text-sm text-gray-500">Telegram</p>
              {user.telegram ? (
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user.telegram}</p>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <Edit2 className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              ) : (
                <button className="text-purple-600 hover:underline text-sm">+ Добавить</button>
              )}
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Структура" icon={<Users className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-3">
            <StructureLink label="Руководитель" value={user.manager} />
            <StructureLink label="HR-бизнес-партнёр" value={user.hrBP} />
            <button
              onClick={() => onNavigate("structure")}
              className="mt-4 text-sm text-purple-600 hover:underline flex items-center gap-1"
            >
              Вся структура / Коллеги по отделу
            </button>
          </div>
        </InfoCard>
      </div>

      <Card title="О себе" icon={<User className="w-5 h-5 text-purple-600" />}>
        <p className="text-gray-700 leading-relaxed">{user.about}</p>
      </Card>

      <Card
        title="Проекты"
        icon={<Award className="w-5 h-5 text-purple-600" />}
        action={
          <button className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Добавить проект
          </button>
        }
      >
        <div className="space-y-3">
          {user.projects.map((project) => (
            <div key={project.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{project.name}</h4>
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
              </div>
              <p className="text-sm text-gray-600 mb-1">{project.role}</p>
              <p className="text-xs text-gray-500">{project.period}</p>
            </div>
          ))}
        </div>
      </Card>

      {user.vacation && (
        <Card title="Отпуск" icon={<Calendar className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">Статус:</p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.vacation.status === "active"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.vacation.status === "active" ? "В отпуске" : "Планируется"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <VacationInfo label="Дата начала" value={user.vacation.dateFrom} />
              <VacationInfo label="Дата окончания" value={user.vacation.dateTo} />
            </div>
            {user.vacation.substitute && (
              <StructureLink label="Замещение" value={user.vacation.substitute} />
            )}
            {user.vacation.comment && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Комментарий</p>
                <p className="text-gray-700">{user.vacation.comment}</p>
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
}: {
  label: string;
  value: string;
  secure?: boolean;
  helper?: string;
  isSmall?: boolean;
}) => (
  <div className="space-y-0.5">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`font-medium flex items-center gap-2 ${isSmall ? "text-sm" : ""}`}>
      {value}
      {secure && <Lock className="w-3 h-3 text-gray-400" />}
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
