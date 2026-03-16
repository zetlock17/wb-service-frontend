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
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationsApi";
import { 
  getOrgHierarchy, 
  moveOrgUnit,
  createOrgUnit,
  updateOrgUnit,
  deleteOrgUnit,
  setOrgUnitManager,
  type OrgUnitHierarchy,
  type OrgUnitCreate,
  type OrgUnitUpdate,
} from "../api/orgStructureApi";
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
  updateCurrentUser: (
    eid: number,
    updatedUser: Partial<UserProfile> & {
      org_unit_id?: number | null;
      manager_eid?: string | null;
      hrbp_eid?: string | null;
    }
  ) => Promise<void>;
  fetchBirthdays: (timeUnit: BirthDayType) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationAsReadAsync: (notificationId: number) => Promise<void>;
  markAllNotificationsAsReadAsync: () => Promise<void>;
  fetchOrgStructure: () => Promise<void>;
  moveOrgUnitAsync: (unitId: number, newParentId?: number | null) => Promise<void>;
  createOrgUnitAsync: (unitData: OrgUnitCreate) => Promise<void>;
  updateOrgUnitAsync: (unitId: number, unitData: OrgUnitUpdate) => Promise<void>;
  deleteOrgUnitAsync: (unitId: number) => Promise<void>;
  setOrgUnitManagerAsync: (unitId: number, managerEid: string) => Promise<void>;
  setApiError: (error: string | null) => void;
  clearApiError: () => void;
  setRoles: (roles: string[]) => void;
}

const mapEventTypeToNotificationType = (eventType: string): NotificationItem["type"] => {
  const normalized = eventType.toLowerCase();

  if (normalized.includes("doc")) return "document";
  if (normalized.includes("comment")) return "comment";
  if (normalized.includes("event")) return "event";
  if (normalized.includes("survey")) return "survey";
  if (normalized.includes("train")) return "training";
  if (normalized.includes("birth")) return "birthday";

  return "news";
};

const formatNotificationTime = (createdAt: string): string => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
        notifications: [],
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

      // Загружаем уведомления отдельно, чтобы не блокировать первичный рендер портала.
      await usePortalStore.getState().fetchNotifications();
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
  
  updateCurrentUser: async (
    eid: number,
    updatedUser: Partial<UserProfile> & {
      org_unit_id?: number | null;
      manager_eid?: string | null;
      hrbp_eid?: string | null;
    }
  ) => {
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
      if (updatedUser.full_name !== undefined) editableData.full_name = updatedUser.full_name;
      if (updatedUser.position !== undefined) editableData.position = updatedUser.position;
      if (updatedUser.org_unit_id !== undefined) editableData.org_unit_id = updatedUser.org_unit_id;
      if (updatedUser.work_phone !== undefined) editableData.work_phone = updatedUser.work_phone;
      if (updatedUser.work_email !== undefined) editableData.work_email = updatedUser.work_email;
      if (updatedUser.manager_eid !== undefined) editableData.manager_eid = updatedUser.manager_eid;
      if (updatedUser.hrbp_eid !== undefined) editableData.hrbp_eid = updatedUser.hrbp_eid;
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

  fetchNotifications: async () => {
    try {
      const response = await getNotifications({ page: 1, size: 100 });

      if (response.status >= 200 && response.status < 300) {
        const mappedNotifications: NotificationItem[] = (response.data.notifications || []).map((item) => ({
          id: item.id,
          type: mapEventTypeToNotificationType(item.event_type),
          text: item.title ? `${item.title}: ${item.message}` : item.message,
          time: formatNotificationTime(item.created_at),
          unread: !item.is_read,
        }));

        set({ notifications: mappedNotifications });
        return;
      }

      set({ notifications: mockNotifications });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ notifications: mockNotifications });
    }
  },

  markNotificationAsReadAsync: async (notificationId: number) => {
    const notification = usePortalStore.getState().notifications.find((item) => item.id === notificationId);
    if (!notification?.unread) {
      return;
    }

    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === notificationId ? { ...item, unread: false } : item
      ),
    }));

    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      set((state) => ({
        notifications: state.notifications.map((item) =>
          item.id === notificationId ? { ...item, unread: true } : item
        ),
      }));
    }
  },

  markAllNotificationsAsReadAsync: async () => {
    const currentNotifications = usePortalStore.getState().notifications;

    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, unread: false })),
    }));

    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      set({ notifications: currentNotifications });
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

  moveOrgUnitAsync: async (unitId: number, newParentId?: number | null) => {
    try {
      await moveOrgUnit(unitId, newParentId);
      // Перезагружаем структуру после операции
      const response = await getOrgHierarchy();
      set({ organizationHierarchy: response.data || [] });
    } catch (error) {
      console.error("Failed to move org unit:", error);
      throw error;
    }
  },

  createOrgUnitAsync: async (unitData: OrgUnitCreate) => {
    try {
      await createOrgUnit(unitData);
      // Перезагружаем структуру после операции
      const response = await getOrgHierarchy();
      set({ organizationHierarchy: response.data || [] });
    } catch (error) {
      console.error("Failed to create org unit:", error);
      throw error;
    }
  },

  updateOrgUnitAsync: async (unitId: number, unitData: OrgUnitUpdate) => {
    try {
      await updateOrgUnit(unitId, unitData);
      // Перезагружаем структуру после операции
      const response = await getOrgHierarchy();
      set({ organizationHierarchy: response.data || [] });
    } catch (error) {
      console.error("Failed to update org unit:", error);
      throw error;
    }
  },

  deleteOrgUnitAsync: async (unitId: number) => {
    try {
      await deleteOrgUnit(unitId);
      // Перезагружаем структуру после операции
      const response = await getOrgHierarchy();
      set({ organizationHierarchy: response.data || [] });
    } catch (error) {
      console.error("Failed to delete org unit:", error);
      throw error;
    }
  },

  setOrgUnitManagerAsync: async (unitId: number, managerEid: string) => {
    try {
      await setOrgUnitManager(unitId, managerEid);
      // Перезагружаем структуру после операции
      const response = await getOrgHierarchy();
      set({ organizationHierarchy: response.data || [] });
    } catch (error) {
      console.error("Failed to set org unit manager:", error);
      throw error;
    }
  },

  setRoles: (roles: string[]) => {
    set({ roles });
  },
}));

export default usePortalStore;
