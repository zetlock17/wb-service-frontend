import { create } from "zustand";
import {
  departments as mockDepartments,
  ideas as mockIdeas,
  news as mockNews,
  documents as mockDocuments,
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
  deleteNotification,
  getNotifications,
  getNotificationPreferences,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences,
  type NotificationPreferencesSchema,
  type NotificationPreferencesUpdateSchema,
} from "../api/notificationsApi";
import { 
  getOrgHierarchy, 
  moveOrgUnit,
  createOrgUnit,
  updateOrgUnit,
  deleteOrgUnit,
  setOrgUnitManager,
  removeOrgUnitManager,
  addEmployeeToOrgUnit,
  removeEmployeeFromOrgUnit,
  searchHierarchy,
  type OrgUnitHierarchy,
  type ProfileSearchEmployee,
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
  unitEmployees: Record<number, ProfileSearchEmployee[]>;
  roles: string[];
  notificationsUnreadCount: number;
  notificationsTotal: number;
  notificationsLoading: boolean;
  notificationPreferences: NotificationPreferencesSchema | null;

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
  fetchUnreadNotificationsCount: () => Promise<void>;
  markNotificationAsReadAsync: (notificationId: number) => Promise<void>;
  markAllNotificationsAsReadAsync: () => Promise<void>;
  deleteNotificationAsync: (notificationId: number) => Promise<void>;
  fetchNotificationPreferences: () => Promise<void>;
  updateNotificationPreferencesAsync: (data: NotificationPreferencesUpdateSchema) => Promise<void>;
  fetchOrgStructure: () => Promise<void>;
  fetchUnitEmployees: () => Promise<void>;
  moveOrgUnitAsync: (unitId: number, newParentId?: number | null) => Promise<void>;
  createOrgUnitAsync: (unitData: OrgUnitCreate) => Promise<void>;
  updateOrgUnitAsync: (unitId: number, unitData: OrgUnitUpdate) => Promise<void>;
  deleteOrgUnitAsync: (unitId: number) => Promise<void>;
  setOrgUnitManagerAsync: (unitId: number, managerEid: string) => Promise<void>;
  removeOrgUnitManagerAsync: (unitId: number) => Promise<void>;
  addEmployeeToOrgUnitAsync: (unitId: number, employeeEid: string) => Promise<void>;
  removeEmployeeFromOrgUnitAsync: (unitId: number, employeeEid: string) => Promise<void>;
  setApiError: (error: string | null) => void;
  clearApiError: () => void;
  setRoles: (roles: string[]) => void;
}

const mapNotificationType = (eventType: string): NotificationItem["type"] => {
  if (eventType.startsWith("DOCUMENT_")) return "document";
  if (eventType.startsWith("COMMENT_")) return "comment";
  if (eventType.startsWith("NEWS_")) return "news";
  if (eventType.startsWith("BIRTHDAY_")) return "birthday";
  if (eventType.startsWith("SURVEY_")) return "survey";
  if (eventType.startsWith("TRAINING_") || eventType.startsWith("COURSE_")) return "training";
  if (eventType.startsWith("EVENT_") || eventType.startsWith("CALENDAR_")) return "event";
  if (eventType.startsWith("SYSTEM_") || eventType.startsWith("SECURITY_")) return "system";
  return "event";
};

const formatNotificationTime = (value: string | null): string => {
  if (!value) return "";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин назад`;
  if (diffHour < 24 && now.getDate() === parsedDate.getDate()) {
    return `сегодня в ${parsedDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDay < 2) {
    return `вчера в ${parsedDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDay < 7) {
    return `${diffDay} дн назад`;
  }
  return parsedDate.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
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
  unitEmployees: {},
  roles: [],
  notificationsUnreadCount: 0,
  notificationsTotal: 0,
  notificationsLoading: false,
  notificationPreferences: null,

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
    set({ notificationsLoading: true });
    try {
      const response = await getNotifications({ page: 1, size: 100 });

      if (response.status >= 200 && response.status < 300) {
        const mappedNotifications: NotificationItem[] = response.data.notifications.map((notification) => ({
          id: notification.id,
          type: mapNotificationType(notification.event_type),
          eventType: notification.event_type,
          title: notification.title,
          text: notification.message,
          time: formatNotificationTime(notification.created_at),
          createdAt: notification.created_at,
          unread: !notification.is_read,
          isMandatory: notification.is_mandatory,
          payload: notification.payload ?? null,
        }));

        set({
          notifications: mappedNotifications,
          notificationsUnreadCount: response.data.unread_count,
          notificationsTotal: response.data.total,
          notificationsLoading: false,
        });
        return;
      }

      set({ notifications: [], notificationsLoading: false });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ notifications: [], notificationsLoading: false });
    }
  },

  fetchUnreadNotificationsCount: async () => {
    try {
      const response = await getUnreadNotificationsCount();
      if (response.status >= 200 && response.status < 300) {
        set({ notificationsUnreadCount: response.data ?? 0 });
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  markNotificationAsReadAsync: async (notificationId: number) => {
    const prev = usePortalStore.getState();
    const wasUnread = prev.notifications.find((n) => n.id === notificationId)?.unread;
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, unread: false } : notification
      ),
      notificationsUnreadCount: wasUnread
        ? Math.max(0, state.notificationsUnreadCount - 1)
        : state.notificationsUnreadCount,
    }));
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllNotificationsAsReadAsync: async () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        unread: false,
      })),
      notificationsUnreadCount: 0,
    }));
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  deleteNotificationAsync: async (notificationId: number) => {
    const prev = usePortalStore.getState();
    const wasUnread = prev.notifications.find((n) => n.id === notificationId)?.unread;
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
      notificationsTotal: Math.max(0, state.notificationsTotal - 1),
      notificationsUnreadCount: wasUnread
        ? Math.max(0, state.notificationsUnreadCount - 1)
        : state.notificationsUnreadCount,
    }));
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  },

  fetchNotificationPreferences: async () => {
    try {
      const response = await getNotificationPreferences();
      if (response.status >= 200 && response.status < 300) {
        set({ notificationPreferences: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch notification preferences:", error);
    }
  },

  updateNotificationPreferencesAsync: async (data: NotificationPreferencesUpdateSchema) => {
    const prev = usePortalStore.getState().notificationPreferences;
    if (prev) {
      set({ notificationPreferences: { ...prev, ...data } as NotificationPreferencesSchema });
    }
    try {
      const response = await updateNotificationPreferences(data);
      if (response.status >= 200 && response.status < 300) {
        set({ notificationPreferences: response.data });
      }
    } catch (error) {
      console.error("Failed to update notification preferences:", error);
      if (prev) set({ notificationPreferences: prev });
    }
  },
  
  fetchOrgStructure: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getOrgHierarchy();
      set({ organizationHierarchy: response.data || [], loading: false });
      void usePortalStore.getState().fetchUnitEmployees();
    } catch (error) {
      console.error("Failed to fetch organization structure:", error);
      set({ error: "Failed to fetch organization structure", organizationHierarchy: [], loading: false });
    }
  },

  fetchUnitEmployees: async () => {
    try {
      const pageSize = 100;
      const all: ProfileSearchEmployee[] = [];
      let offset = 0;
      let total = Infinity;
      while (offset < total) {
        const resp = await searchHierarchy("", offset, pageSize);
        if (resp.status !== 200 || !resp.data) break;
        const results = resp.data.results || [];
        all.push(...results);
        total = resp.data.total ?? all.length;
        if (results.length === 0) break;
        offset += results.length;
        if (all.length >= 5000) break;
      }
      const byUnit: Record<number, ProfileSearchEmployee[]> = {};
      for (const e of all) {
        const uid = e.organization_unit_id != null ? Number(e.organization_unit_id) : NaN;
        if (!Number.isFinite(uid)) continue;
        (byUnit[uid] ||= []).push(e);
      }
      set({ unitEmployees: byUnit });
    } catch (error) {
      console.error("Failed to fetch unit employees:", error);
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

  removeOrgUnitManagerAsync: async (unitId: number) => {
    try {
      await removeOrgUnitManager(unitId);
      const response = await getOrgHierarchy();
      set({ organizationHierarchy: response.data || [] });
    } catch (error) {
      console.error("Failed to remove org unit manager:", error);
      throw error;
    }
  },

  addEmployeeToOrgUnitAsync: async (unitId: number, employeeEid: string) => {
    try {
      await addEmployeeToOrgUnit(unitId, employeeEid);

      // Оптимистично переносим запись о сотруднике в новое подразделение,
      // т.к. Elasticsearch индексируется не сразу.
      set((state) => {
        const next: Record<number, ProfileSearchEmployee[]> = {};
        let moved: ProfileSearchEmployee | null = null;
        for (const [uidStr, list] of Object.entries(state.unitEmployees)) {
          const uid = Number(uidStr);
          const filtered: ProfileSearchEmployee[] = [];
          for (const emp of list) {
            if (emp.eid === employeeEid) {
              moved = emp;
            } else {
              filtered.push(emp);
            }
          }
          next[uid] = filtered;
        }
        const targetEmp: ProfileSearchEmployee = moved ?? {
          eid: employeeEid,
          full_name: employeeEid,
          position: "",
          organization_unit_id: String(unitId),
          score: 0,
        };
        next[unitId] = [...(next[unitId] || []), { ...targetEmp, organization_unit_id: String(unitId) }];
        return { unitEmployees: next };
      });

      const response = await getOrgHierarchy();
      set({ organizationHierarchy: response.data || [] });
      void usePortalStore.getState().fetchUnitEmployees();
    } catch (error) {
      console.error("Failed to add employee to org unit:", error);
      throw error;
    }
  },

  removeEmployeeFromOrgUnitAsync: async (unitId: number, employeeEid: string) => {
    try {
      await removeEmployeeFromOrgUnit(unitId, employeeEid);

      // Оптимистично убираем сотрудника из подразделения,
      // не дожидаясь переиндексации Elasticsearch.
      set((state) => ({
        unitEmployees: {
          ...state.unitEmployees,
          [unitId]: (state.unitEmployees[unitId] || []).filter((e) => e.eid !== employeeEid),
        },
      }));

      const response = await getOrgHierarchy();
      set({ organizationHierarchy: response.data || [] });
      void usePortalStore.getState().fetchUnitEmployees();
    } catch (error) {
      console.error("Failed to remove employee from org unit:", error);
      throw error;
    }
  },

  setRoles: (roles: string[]) => {
    set({ roles });
  },
}));

export default usePortalStore;
