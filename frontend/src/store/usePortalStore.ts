import { create } from "zustand";
import {
  departments as mockDepartments,
  ideas as mockIdeas,
  news as mockNews,
  documents as mockDocuments,
  notifications as mockNotifications,
  calendarEvents as mockCalendarEvents,
  courses as mockCourses,
  employees as mockEmployees,
  surveys as mockSurveys,
  knowledgeBase as mockKnowledgeBase,
  reports as mockReports,
} from "../data/mockData";
import { getProfile, updateProfile } from "../api/profileApi";
import { getBirthdays } from "../api/birthdaysApi";
import { getOrgHierarchy, type OrgUnitHierarchy } from "../api/orgStructureApi";
import type {
  Birthday,
  BirthDayType,
  CalendarEvent,
  Course,
  Department,
  DocumentItem,
  Employee,
  Idea,
  KnowledgeArticle,
  NewsItem,
  NotificationItem,
  ReportCard,
  Survey,
  UserProfile,
} from "../types/portal";

interface PortalState {
  departments: Department[];
  ideas: Idea[];
  news: NewsItem[];
  documents: DocumentItem[];
  currentUser: UserProfile | null;
  notifications: NotificationItem[];
  calendarEvents: CalendarEvent[];
  courses: Course[];
  employees: Employee[];
  surveys: Survey[];
  knowledgeBase: KnowledgeArticle[];
  reports: ReportCard[];
  upcomingBirthdays: Birthday[];
  organizationHierarchy: OrgUnitHierarchy[];
  roles: string[];

  loading: boolean;
  error: string | null;
  hasApiError: boolean;

  fetchPortalData: () => Promise<void>;
  fetchProfile: (eid: number) => Promise<void>;
  updateCurrentUser: (eid: number, updatedUser: Partial<UserProfile>) => Promise<void>;
  fetchBirthdays: (timeUnit: BirthDayType) => Promise<void>;
  fetchOrgStructure: () => Promise<void>;
  setApiError: (error: string | null) => void;
  clearApiError: () => void;
  setRoles: (roles: string[]) => void;
}

const usePortalStore = create<PortalState>((set) => ({
  departments: [],
  ideas: [],
  news: [],
  documents: [],
  currentUser: null,
  notifications: [],
  calendarEvents: [],
  courses: [],
  employees: [],
  surveys: [],
  knowledgeBase: [],
  reports: [],
  upcomingBirthdays: [],
  organizationHierarchy: [],
  roles: [],

  loading: false,
  error: null,
  hasApiError: false,

  fetchPortalData: async () => {
    set({ loading: true, error: null });
    try {
      // Загружаем профиль с бэкенда
      const profileResponse = await getProfile(1); // Временно используем eid = 1
      
      // Загружаем дни рождения с бэкенда (по умолчанию week, как в фильтре)
      const birthdaysResponse = await getBirthdays('week');
      
      // Загружаем организационную структуру с бэкенда
      const orgStructureResponse = await getOrgHierarchy();
      
      // Загружаем остальные данные из моков
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      set({
        departments: mockDepartments,
        ideas: mockIdeas,
        news: mockNews,
        documents: mockDocuments,
        currentUser: profileResponse.data,
        notifications: mockNotifications,
        calendarEvents: mockCalendarEvents,
        courses: mockCourses,
        employees: mockEmployees,
        surveys: mockSurveys,
        knowledgeBase: mockKnowledgeBase,
        reports: mockReports,
        upcomingBirthdays: birthdaysResponse.birthdays || [],
        organizationHierarchy: orgStructureResponse.data || [],
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      set({ error: "Failed to fetch data", loading: false });
    }
  },
  
  fetchProfile: async (eid: number) => {
    set({ loading: true, error: null });
    try {
      const response = await getProfile(eid);
      set({ currentUser: response.data, loading: false });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      set({ error: "Failed to fetch profile", loading: false });
    }
  },
  
  updateCurrentUser: async (eid: number, updatedUser: Partial<UserProfile>) => {
    const currentState = usePortalStore.getState().currentUser;
    
    try {
      // Оптимистичное обновление UI
      set((state) => ({
        currentUser: state.currentUser ? { ...state.currentUser, ...updatedUser } : null,
      }));
      
      // Формируем данные для отправки (только редактируемые поля согласно ProfileUpdateSchema)
      const editableData: any = {};
      if (updatedUser.personal_phone !== undefined) editableData.personal_phone = updatedUser.personal_phone;
      if (updatedUser.telegram !== undefined) editableData.telegram = updatedUser.telegram;
      if (updatedUser.about_me !== undefined) editableData.about_me = updatedUser.about_me;
      if (updatedUser.projects !== undefined) editableData.projects = updatedUser.projects;
      if (updatedUser.avatar_id !== undefined) editableData.avatar_id = updatedUser.avatar_id;
      // Примечание: vacations не входят в ProfileUpdateSchema и не могут быть отредактированы
      
      // Отправляем обновление на бэкенд
      const response = await updateProfile(eid, editableData);
      
      // Обновляем данными с сервера
      if (response.status === 200 && response.data) {
        set({ currentUser: response.data, error: null });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      // В случае ошибки, откатываем к предыдущему состоянию
      set({ currentUser: currentState, error: "Failed to update profile" });
      
      // Перезагружаем профиль с сервера для синхронизации
      try {
        const response = await getProfile(eid);
        if (response.data) {
          set({ currentUser: response.data });
        }
      } catch (fetchError) {
        console.error("Failed to fetch profile after update error:", fetchError);
      }
    }
  },
  
  fetchBirthdays: async (timeUnit: BirthDayType) => {
    try {
      const response = await getBirthdays(timeUnit);
      set({ upcomingBirthdays: response.birthdays || [] });
    } catch (error) {
      console.error("Failed to fetch birthdays:", error);
      set({ upcomingBirthdays: [] });
    }
  },
  
  fetchOrgStructure: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getOrgHierarchy();
      set({ organizationHierarchy: response.data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch organization structure:", error);
      set({ error: "Failed to fetch organization structure", organizationHierarchy: [], loading: false });
    }
  },

  setApiError: (error: string | null) => {
    set({ hasApiError: !!error, error });
  },

  clearApiError: () => {
    set({ hasApiError: false, error: null });
  },

  setRoles: (roles: string[]) => {
    set({ roles });
  },
}));

export default usePortalStore;
