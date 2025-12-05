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

export interface ProfileVacation {
  id: number;
  is_planned: boolean;
  start_date: string;
  end_date: string;
  substitute: string;
  comment: string;
  is_official: boolean;
}

export interface ProfileProject {
  id: number;
  name: string;
  start_d: string;
  end_d: string;
  position: string;
  link: string;
}

export interface UserProfile {
  eid: number;
  full_name: string;
  position: string;
  department: string;
  birth_date: string;
  hire_date: string;
  personal_phone: string;
  work_phone: string;
  work_email: string;
  work_band: string;
  telegram: string;
  manager_name: string;
  hr_name: string;
  about_me: string;
  projects: ProfileProject[];
  vacations: ProfileVacation[];
}

export interface CanEdit {
  personal_phone?: string;
  telegram?: string;
  about_me?: string;
  projects?: ProfileProject[];
  vacations?: ProfileVacation[];
}

// Legacy interfaces for backward compatibility
export interface Employee {
  id: number;
  full_name: string;
  position: string;
  department_id: number;
  birth_date: string;
  hire_date: string;
  work_phone: string;
  work_email: string;
  work_band: string;
  manager_eid: number | null;
  hrbp_eid: number | null;
}

export interface Department {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface Profile {
  id: number;
  employee_id: number;
  avatar_id: number | null;
  personal_phone: string;
  telegram: string;
  about_me: string;
}

export interface AuthToken {
  id: number;
  employee_eid: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface File {
  id: number;
  name: string;
  path: string;
}

export interface AlembicVersion {
  version_num: string;
}

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

export type BirthDayType = 'day' | 'week' | 'month';

export interface Birthday {
  eid: number;
  full_name: string,
  department: string,
  birth_date: string;
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

export interface EditableFields {
  userProfile: Record<keyof UserProfile, boolean>;
}

export interface GlobalSearchResults {
  documents: DocumentItem[];
  knowledge: KnowledgeArticle[];
  employees: Employee[];
  news: NewsItem[];
}

export const editableFields: EditableFields = {
  userProfile: {
    eid: false,
    full_name: false,
    position: false,
    department: false,
    birth_date: false,
    hire_date: false,
    personal_phone: true,
    work_phone: false,
    work_email: false,
    work_band: false,
    telegram: true,
    manager_name: false,
    hr_name: false,
    about_me: true,
    projects: false,
    vacations: false,
  },
};
