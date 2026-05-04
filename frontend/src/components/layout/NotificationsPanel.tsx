import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import usePortalStore from "../../store/usePortalStore";
import type { NotificationItem } from "../../types/portal";

const filters: Array<{ id: NotificationItem["type"] | "all"; label: string }> = [
  { id: "all", label: "Все" },
  { id: "document", label: "Документы" },
  { id: "comment", label: "Комментарии" },
  { id: "news", label: "Новости" },
  { id: "event", label: "События" },
  { id: "survey", label: "Опросы" },
  { id: "training", label: "Обучение" },
  { id: "birthday", label: "Дни рождения" },
];

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
  const [filter, setFilter] = useState<NotificationItem["type"] | "all">("all");
  const notifications = usePortalStore((state) => state.notifications);
  const fetchNotifications = usePortalStore((state) => state.fetchNotifications);
  const markNotificationAsReadAsync = usePortalStore((state) => state.markNotificationAsReadAsync);
  const markAllNotificationsAsReadAsync = usePortalStore((state) => state.markAllNotificationsAsReadAsync);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const filteredNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => filter === "all" || notification.type === filter,
      ),
    [notifications, filter],
  );

  useEffect(() => {
    if (!isOpen) return;
    void fetchNotifications();
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    let removeListener: (() => void) | undefined;

    const timer = setTimeout(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
          onCloseRef.current();
        }
      };
      document.addEventListener('click', handleClickOutside);
      removeListener = () => document.removeEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      removeListener?.();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={panelRef} className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[500px] overflow-y-auto z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Уведомления</h3>
          <button
            onClick={() => markAllNotificationsAsReadAsync()}
            className="text-xs text-purple-700 hover:text-purple-800"
          >
            Прочитать все
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === item.id ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {filteredNotifications.length ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markNotificationAsReadAsync(notification.id)}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${notification.unread ? "bg-purple-50" : ""}`}
            >
              <p className="text-sm text-gray-900 mb-1">{notification.text}</p>
              <p className="text-xs text-gray-500">{notification.time}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Нет уведомлений</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
