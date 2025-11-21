import type { LucideIcon } from "lucide-react";

export type ModuleId =
  | "home"
  | "structure"
  | "documents"
  | "knowledge"
  | "news"
  | "surveys"
  | "ideas"
  | "calendar"
  | "training"
  | "reports";

export interface VacationPlan {
  status: "planned" | "active";
  dateFrom: string;
  dateTo: string;
  substitute?: string;
  comment?: string;
}

export interface Project {
  id: number;
  name: string;
  role: string;
  period: string;
  link?: string;
}

export interface UserProfile {
  eid: string;
  name: string;
  position: string;
  department: string;
  parentDepartment: string;
  email: string;
  phone: string;
  personalPhone: string;
  telegram?: string;
  birthday: string;
  startDate: string;
  band: string;
  manager: string;
  hrBP: string;
  vacation?: VacationPlan;
  projects: Project[];
  about: string;
}

export interface NotificationItem {
  id: number;
  type:
    | "document"
    | "comment"
    | "news"
    | "event"
    | "survey"
    | "training"
    | "birthday";
  text: string;
  time: string;
  unread?: boolean;
}

export interface DocumentItem {
  id: number;
  title: string;
  type: string;
  status: "Актуален" | "Архивный";
  date: string;
  author: string;
  version: string;
  views: number;
}

export interface NewsItem {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  likes: number;
  comments: number;
  pinned?: boolean;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  category: string;
  tags: string[];
  views: number;
  rating: number;
  author: string;
  date: string;
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  status: "active" | "completed";
  endDate: string;
  responses: number;
  total: number;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
  status: "Реализована" | "В работе" | "Принята" | "На рассмотрении";
  votes: number;
  comments: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  progress: number;
  status: "completed" | "in_progress" | "not_started";
  mandatory: boolean;
  certificate?: string;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  phone: string;
  email: string;
}

export interface Birthday {
  name: string;
  date: string;
  department: string;
  period: "today" | "week" | "month";
}

export interface ReportCard {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  icon: LucideIcon;
}

export interface GlobalSearchResults {
  documents: DocumentItem[];
  knowledge: KnowledgeArticle[];
  employees: Employee[];
  news: NewsItem[];
}
