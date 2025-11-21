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

export interface ProfileVacation {
  id: number;
  profile_id: number;
  is_planned: boolean;
  start_date: string;
  end_date: string;
  substitute_eid: number | null;
  comment: string;
  is_official: boolean;
}

export interface ProfileProject {
  id: number;
  profile_id: number;
  name: string;
  start_d: string;
  end_d: string | null;
  position: string;
  link: string;
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

export interface UserProfile {
  employee: Employee;
  profile: Profile;
  department?: Department;
  manager?: Employee;
  hrbp?: Employee;
  vacations: ProfileVacation[];
  projects: ProfileProject[];
  avatar?: File;
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
