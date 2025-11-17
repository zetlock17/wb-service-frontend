import { create } from "zustand";
import {
  ideas as mockIdeas,
  news as mockNews,
  documents as mockDocuments,
  currentUser as mockCurrentUser,
  notifications as mockNotifications,
  calendarEvents as mockCalendarEvents,
  courses as mockCourses,
  employees as mockEmployees,
  surveys as mockSurveys,
  knowledgeBase as mockKnowledgeBase,
  reports as mockReports,
  upcomingBirthdays as mockUpcomingBirthdays,
} from "../data/mockData";
import type {
  Birthday,
  CalendarEvent,
  Course,
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

  loading: boolean;
  error: string | null;

  fetchPortalData: () => Promise<void>;
}

const usePortalStore = create<PortalState>((set) => ({
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

  loading: false,
  error: null,

  fetchPortalData: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({
        ideas: mockIdeas,
        news: mockNews,
        documents: mockDocuments,
        currentUser: mockCurrentUser,
        notifications: mockNotifications,
        calendarEvents: mockCalendarEvents,
        courses: mockCourses,
        employees: mockEmployees,
        surveys: mockSurveys,
        knowledgeBase: mockKnowledgeBase,
        reports: mockReports,
        upcomingBirthdays: mockUpcomingBirthdays,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      set({ error: "Failed to fetch data", loading: false });
    }
  },
}));

export default usePortalStore;
