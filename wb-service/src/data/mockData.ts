import {
  Activity,
  BarChart3,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  Home,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import type {
  Birthday,
  CalendarEvent,
  Course,
  DocumentItem,
  Employee,
  Idea,
  KnowledgeArticle,
  ModuleConfig,
  NewsItem,
  NotificationItem,
  ReportCard,
  Survey,
  UserProfile,
} from "../types/portal";

export const currentUser: UserProfile = {
  eid: "WB001234",
  name: "Иван Петров",
  position: "Ведущий специалист",
  department: "Департамент информационных технологий",
  parentDepartment: "Дирекция по технологиям",
  email: "i.petrov@wbbank.ru",
  phone: "+7 (495) 123-45-67",
  personalPhone: "+7 (916) 555-12-34",
  telegram: "@ipetrov",
  birthday: "15 марта",
  startDate: "01.03.2022",
  band: "Band 3",
  manager: "Анна Сидорова",
  hrBP: "Мария Козлова",
  vacation: {
    status: "planned",
    dateFrom: "15.12.2024",
    dateTo: "29.12.2024",
    substitute: "Петр Смирнов",
    comment: "Новогодние праздники",
  },
  projects: [
    {
      id: 1,
      name: "Разработка мобильного приложения",
      role: "Backend разработчик",
      period: "Янв 2024 - настоящее время",
      link: "https://youtrack.example.com/project1",
    },
    {
      id: 2,
      name: "Модернизация CRM системы",
      role: "Тех. лидер",
      period: "Сен 2023 - Дек 2023",
      link: "https://youtrack.example.com/project2",
    },
  ],
  about:
    "Опытный специалист с 5+ летним стажем в разработке корпоративных систем. Специализируюсь на backend разработке и архитектуре приложений.",
};

export const notifications: NotificationItem[] = [
  {
    id: 1,
    type: "document",
    text: 'Новый документ требует ознакомления: "Политика безопасности v2.0"',
    time: "10 мин назад",
    unread: true,
  },
  {
    id: 2,
    type: "comment",
    text: "Петр Смирнов упомянул вас в комментарии к новости",
    time: "15 мин назад",
    unread: true,
  },
  {
    id: 3,
    type: "news",
    text: 'Новая новость: "Итоги квартала и планы развития"',
    time: "1 час назад",
    unread: true,
  },
  {
    id: 4,
    type: "event",
    text: "Напоминание: Совещание отдела через 30 минут",
    time: "2 часа назад",
  },
  {
    id: 5,
    type: "survey",
    text: 'Новый опрос: "Оценка корпоративных сервисов"',
    time: "3 часа назад",
  },
  {
    id: 6,
    type: "training",
    text: 'Вам назначен курс: "Основы кибербезопасности"',
    time: "5 часов назад",
  },
  {
    id: 7,
    type: "comment",
    text: 'Новый комментарий к вашей идее "Автоматизация процессов"',
    time: "1 день назад",
  },
  {
    id: 8,
    type: "birthday",
    text: "Сегодня день рождения у Петра Смирнова!",
    time: "Сегодня",
  },
];

export const documents: DocumentItem[] = [
  {
    id: 1,
    title: "Политика безопасности",
    type: "Политика",
    status: "Актуален",
    date: "15.10.2024",
    author: "Отдел ИБ",
    version: "2.0",
    views: 245,
  },
  {
    id: 2,
    title: "Регламент работы с клиентами",
    type: "Регламент",
    status: "Актуален",
    date: "01.11.2024",
    author: "Департамент продаж",
    version: "1.5",
    views: 189,
  },
  {
    id: 3,
    title: "Письмо ЦБ №123-П",
    type: "Письмо ЦБ",
    status: "Актуален",
    date: "20.10.2024",
    author: "Юридический отдел",
    version: "1.0",
    views: 312,
  },
  {
    id: 4,
    title: "Инструкция по работе в CRM",
    type: "Инструкция",
    status: "Актуален",
    date: "05.11.2024",
    author: "IT отдел",
    version: "3.2",
    views: 567,
  },
  {
    id: 5,
    title: "Приказ о графике работы",
    type: "Приказ",
    status: "Архивный",
    date: "01.01.2024",
    author: "HR департамент",
    version: "1.0",
    views: 89,
  },
];

export const news: NewsItem[] = [
  {
    id: 1,
    title: "Итоги третьего квартала 2024",
    category: "Официальные документы",
    excerpt:
      "Банк показал рекордные результаты за квартал. Рост активов составил 15%...",
    content:
      "Банк показал рекордные результаты за квартал. Рост активов составил 15%, количество клиентов увеличилось на 20%. Команда продемонстрировала отличные результаты.",
    date: "05.11.2024",
    author: "Дирекция",
    likes: 45,
    comments: 12,
    pinned: true,
  },
  {
    id: 2,
    title: "Обновление корпоративного портала",
    category: "IT-новости",
    excerpt: "Запущена новая версия портала с улучшенным интерфейсом...",
    content:
      "Запущена новая версия портала с улучшенным интерфейсом и новыми функциями.",
    date: "04.11.2024",
    author: "IT департамент",
    likes: 32,
    comments: 8,
  },
];

export const knowledgeBase: KnowledgeArticle[] = [
  {
    id: 1,
    title: "Настройка VPN для удаленной работы",
    category: "IT",
    tags: ["VPN", "Безопасность"],
    views: 432,
    rating: 4.8,
    author: "Иван Техников",
    date: "20.10.2024",
  },
  {
    id: 2,
    title: "Процедура оформления отпуска",
    category: "HR",
    tags: ["Отпуск", "Кадры"],
    views: 789,
    rating: 4.9,
    author: "Мария Кадрова",
    date: "15.10.2024",
  },
  {
    id: 3,
    title: "Руководство для новых сотрудников",
    category: "Новичку",
    tags: ["Адаптация"],
    views: 1234,
    rating: 5,
    author: "HR команда",
    date: "01.10.2024",
  },
];

export const surveys: Survey[] = [
  {
    id: 1,
    title: "Оценка корпоративных сервисов",
    description: "Помогите нам улучшить качество сервисов",
    status: "active",
    endDate: "15.11.2024",
    responses: 45,
    total: 120,
  },
  {
    id: 2,
    title: "Удовлетворенность условиями работы",
    description: "Анонимный опрос",
    status: "active",
    endDate: "20.11.2024",
    responses: 78,
    total: 120,
  },
];

export const ideas: Idea[] = [
  {
    id: 1,
    title: "Автоматизация процесса согласования",
    description: "Внедрить систему электронных согласований",
    author: "Иван Петров",
    date: "01.11.2024",
    status: "В работе",
    votes: 24,
    comments: 8,
  },
  {
    id: 2,
    title: "Корпоративная программа спорта",
    description: "Организовать спортивные секции",
    author: "Анна Сидорова",
    date: "28.10.2024",
    status: "На рассмотрении",
    votes: 56,
    comments: 15,
  },
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Совещание отдела",
    date: "06.11.2024",
    time: "10:00",
    location: "Конференц-зал А",
    participants: 8,
  },
  {
    id: 2,
    title: "Тренинг по безопасности",
    date: "07.11.2024",
    time: "14:00",
    location: "Онлайн (Zoom)",
    participants: 25,
  },
  {
    id: 3,
    title: "Корпоративный день здоровья",
    date: "15.11.2024",
    time: "09:00",
    location: "Спорткомплекс",
    participants: 120,
  },
];

export const courses: Course[] = [
  {
    id: 1,
    title: "Основы безопасности данных",
    description: "Обязательный курс",
    duration: "2 часа",
    progress: 100,
    status: "completed",
    mandatory: true,
    certificate: "certificate-link",
  },
  {
    id: 2,
    title: "Работа в CRM системе",
    description: "Практический курс",
    duration: "4 часа",
    progress: 65,
    status: "in_progress",
    mandatory: false,
  },
  {
    id: 3,
    title: "Эффективные коммуникации",
    description: "Развитие навыков",
    duration: "3 часа",
    progress: 0,
    status: "not_started",
    mandatory: false,
  },
];

export const employees: Employee[] = [
  {
    id: 1,
    name: "Анна Сидорова",
    position: "Руководитель отдела",
    department: "IT департамент",
    phone: "+7 (495) 123-45-68",
    email: "a.sidorova@wbbank.ru",
  },
  {
    id: 2,
    name: "Мария Козлова",
    position: "HR бизнес-партнер",
    department: "HR департамент",
    phone: "+7 (495) 123-45-69",
    email: "m.kozlova@wbbank.ru",
  },
  {
    id: 3,
    name: "Петр Смирнов",
    position: "Старший разработчик",
    department: "IT департамент",
    phone: "+7 (495) 123-45-70",
    email: "p.smirnov@wbbank.ru",
  },
  {
    id: 4,
    name: "Елена Волкова",
    position: "Главный бухгалтер",
    department: "Бухгалтерия",
    phone: "+7 (495) 123-45-71",
    email: "e.volkova@wbbank.ru",
  },
  {
    id: 5,
    name: "Дмитрий Орлов",
    position: "Юрист",
    department: "Юридический отдел",
    phone: "+7 (495) 123-45-72",
    email: "d.orlov@wbbank.ru",
  },
  {
    id: 6,
    name: "Ольга Новикова",
    position: "Менеджер по продажам",
    department: "Отдел продаж",
    phone: "+7 (495) 123-45-73",
    email: "o.novikova@wbbank.ru",
  },
  {
    id: 7,
    name: "Игорь Белов",
    position: "Аналитик",
    department: "IT департамент",
    phone: "+7 (495) 123-45-74",
    email: "i.belov@wbbank.ru",
  },
  {
    id: 8,
    name: "Светлана Морозова",
    position: "Специалист HR",
    department: "HR департамент",
    phone: "+7 (495) 123-45-75",
    email: "s.morozova@wbbank.ru",
  },
];

export const upcomingBirthdays: Birthday[] = [
  { name: "Петр Смирнов", date: "Сегодня", department: "IT департамент", period: "today" },
  { name: "Елена Волкова", date: "7 ноября", department: "Бухгалтерия", period: "week" },
  { name: "Дмитрий Орлов", date: "10 ноября", department: "Юридический отдел", period: "week" },
  { name: "Анна Соколова", date: "20 ноября", department: "Маркетинг", period: "month" },
  { name: "Игорь Белов", date: "25 ноября", department: "Продажи", period: "month" },
];

export const reports: ReportCard[] = [
  {
    id: 1,
    name: "Активность пользователей",
    description: "Статистика входов и действий",
    icon: Activity,
  },
  {
    id: 2,
    name: "Документооборот",
    description: "Метрики по документам",
    icon: FileText,
  },
  {
    id: 3,
    name: "Обучение сотрудников",
    description: "Прогресс по курсам",
    icon: GraduationCap,
  },
];

export const modules: ModuleConfig[] = [
  { id: "home", name: "Главная", icon: Home },
  { id: "structure", name: "Структура", icon: Users },
  { id: "documents", name: "Документы", icon: FileText },
  { id: "knowledge", name: "База знаний", icon: BookOpen },
  { id: "news", name: "Новости", icon: MessageSquare },
  { id: "surveys", name: "Опросы", icon: BarChart3 },
  { id: "ideas", name: "Идеи", icon: Lightbulb },
  { id: "calendar", name: "Календарь", icon: Calendar },
  { id: "training", name: "Обучение", icon: GraduationCap },
  { id: "reports", name: "Отчётность", icon: TrendingUp },
];

