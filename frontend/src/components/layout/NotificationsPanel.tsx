import {
  AlertTriangle,
  Bell,
  Calendar as CalendarIcon,
  Cake,
  CheckCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Loader2,
  MessageSquare,
  Newspaper,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePortalStore from "../../store/usePortalStore";
import type { NotificationItem, NotificationType } from "../../types/portal";
import NotificationPreferencesModal from "./NotificationPreferencesModal";

type FilterId = NotificationType | "all" | "unread";

const filters: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "Все" },
  { id: "unread", label: "Непрочитанные" },
  { id: "document", label: "Документы" },
  { id: "comment", label: "Комментарии" },
  { id: "news", label: "Новости" },
  { id: "event", label: "События" },
  { id: "survey", label: "Опросы" },
  { id: "training", label: "Обучение" },
  { id: "birthday", label: "Дни рождения" },
  { id: "system", label: "Системные" },
];

const typeMeta: Record<NotificationType, { icon: typeof Bell; bg: string; color: string }> = {
  document: { icon: FileText, bg: "bg-blue-100", color: "text-blue-600" },
  comment: { icon: MessageSquare, bg: "bg-green-100", color: "text-green-600" },
  news: { icon: Newspaper, bg: "bg-purple-100", color: "text-purple-600" },
  event: { icon: CalendarIcon, bg: "bg-orange-100", color: "text-orange-600" },
  survey: { icon: ClipboardList, bg: "bg-pink-100", color: "text-pink-600" },
  training: { icon: GraduationCap, bg: "bg-indigo-100", color: "text-indigo-600" },
  birthday: { icon: Cake, bg: "bg-rose-100", color: "text-rose-600" },
  system: { icon: AlertTriangle, bg: "bg-amber-100", color: "text-amber-600" },
};

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const buildNavigationPath = (notification: NotificationItem): string | null => {
  const payload = notification.payload ?? {};
  const get = (k: string): string | number | undefined => {
    const v = payload[k];
    return typeof v === "string" || typeof v === "number" ? v : undefined;
  };

  switch (notification.type) {
    case "document": {
      const id = get("document_id");
      return id != null ? `/documents` : `/documents`;
    }
    case "news": {
      const id = get("news_id");
      return id != null ? `/news/${id}` : "/news";
    }
    case "comment": {
      const newsId = get("news_id");
      if (newsId != null) return `/news/${newsId}`;
      const docId = get("document_id");
      if (docId != null) return `/documents`;
      return null;
    }
    case "event":
      return "/calendar";
    case "survey":
      return "/surveys";
    case "training":
      return "/training";
    case "birthday": {
      const eid = get("eid") ?? get("user_eid");
      return eid != null ? `/profile/${eid}` : "/home";
    }
    case "system":
      return null;
    default:
      return null;
  }
};

const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
  const [filter, setFilter] = useState<FilterId>("all");
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const navigate = useNavigate();
  const notifications = usePortalStore((state) => state.notifications);
  const notificationsLoading = usePortalStore((state) => state.notificationsLoading);
  const notificationsUnreadCount = usePortalStore((state) => state.notificationsUnreadCount);
  const fetchNotifications = usePortalStore((state) => state.fetchNotifications);
  const markNotificationAsReadAsync = usePortalStore((state) => state.markNotificationAsReadAsync);
  const markAllNotificationsAsReadAsync = usePortalStore((state) => state.markAllNotificationsAsReadAsync);
  const deleteNotificationAsync = usePortalStore((state) => state.deleteNotificationAsync);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const isPrefsOpenRef = useRef(isPrefsOpen);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    isPrefsOpenRef.current = isPrefsOpen;
  }, [isPrefsOpen]);

  const counts = useMemo(() => {
    const map: Partial<Record<FilterId, number>> = { all: notifications.length, unread: 0 };
    for (const n of notifications) {
      map[n.type] = (map[n.type] ?? 0) + 1;
      if (n.unread) map.unread = (map.unread ?? 0) + 1;
    }
    return map;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const list = filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => n.unread)
        : notifications.filter((n) => n.type === filter);
    return [...list].sort((a, b) => {
      const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bT - aT;
    });
  }, [notifications, filter]);

  useEffect(() => {
    if (!isOpen) return;
    void fetchNotifications();
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    let removeListener: (() => void) | undefined;

    const timer = setTimeout(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (isPrefsOpenRef.current) return;
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
          onCloseRef.current();
        }
      };
      document.addEventListener("click", handleClickOutside);
      removeListener = () => document.removeEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      removeListener?.();
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.unread) {
      void markNotificationAsReadAsync(notification.id);
    }
    const path = buildNavigationPath(notification);
    if (path) {
      onClose();
      navigate(path);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        ref={panelRef}
        className="absolute right-0 mt-2 w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[600px] flex flex-col z-50 overflow-hidden animate-[fadeIn_0.15s_ease-out]"
      >
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-700" />
              <h3 className="font-semibold text-gray-900">Уведомления</h3>
              {notificationsUnreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-600 text-white">
                  {notificationsUnreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => markAllNotificationsAsReadAsync()}
                disabled={notificationsUnreadCount === 0}
                title="Прочитать все"
                className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPrefsOpen(true)}
                title="Настройки уведомлений"
                className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                title="Закрыть"
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filters.map((item) => {
              const count = counts[item.id];
              const isActive = filter === item.id;
              if (item.id !== "all" && item.id !== "unread" && !count) return null;
              return (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{item.label}</span>
                  {count != null && count > 0 && (
                    <span
                      className={`px-1 rounded-full text-[10px] font-medium ${
                        isActive ? "bg-white/25 text-white" : "bg-white text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {notificationsLoading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-purple-500" />
              <p className="text-sm">Загрузка...</p>
            </div>
          ) : filteredNotifications.length ? (
            filteredNotifications.map((notification) => {
              const meta = typeMeta[notification.type];
              const Icon = meta.icon;
              const path = buildNavigationPath(notification);
              const clickable = Boolean(path) || notification.unread;
              return (
                <div
                  key={notification.id}
                  onClick={() => clickable && handleNotificationClick(notification)}
                  className={`group relative p-3 flex gap-3 transition-colors ${
                    clickable ? "cursor-pointer hover:bg-gray-50" : ""
                  } ${notification.unread ? "bg-purple-50/60" : ""}`}
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${meta.bg}`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title || "Уведомление"}
                          </p>
                          {notification.isMandatory && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-100 text-red-700">
                              Обязательно
                            </span>
                          )}
                          {notification.unread && (
                            <span className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notification.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {notification.unread && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void markNotificationAsReadAsync(notification.id);
                        }}
                        title="Отметить прочитанным"
                        className="p-1 text-gray-400 hover:text-purple-700 hover:bg-white rounded"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteNotificationAsync(notification.id);
                      }}
                      title="Удалить"
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                {filter === "unread" ? "Все уведомления прочитаны" : "Нет уведомлений"}
              </p>
            </div>
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
            <span>
              Показано {filteredNotifications.length} из {notifications.length}
            </span>
            <button
              onClick={() => fetchNotifications()}
              className="text-purple-700 hover:text-purple-800 font-medium"
            >
              Обновить
            </button>
          </div>
        )}
      </div>

      <NotificationPreferencesModal isOpen={isPrefsOpen} onClose={() => setIsPrefsOpen(false)} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default NotificationsPanel;
