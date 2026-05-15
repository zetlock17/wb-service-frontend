import { useEffect, useState } from "react";
import { Bell, Globe, Mail, MessageCircle } from "lucide-react";
import Modal from "../common/Modal";
import usePortalStore from "../../store/usePortalStore";
import type { NotificationPreferencesUpdateSchema } from "../../api/notificationsApi";

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToggleRowProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

const ToggleRow = ({ icon, title, description, checked, onChange }: ToggleRowProps) => (
  <div className="flex items-center justify-between gap-4 py-3 px-3 rounded-lg hover:bg-gray-50">
    <div className="flex items-start gap-3 flex-1 min-w-0">
      {icon && <div className="text-purple-600 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? "bg-purple-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const NotificationPreferencesModal = ({ isOpen, onClose }: NotificationPreferencesModalProps) => {
  const preferences = usePortalStore((state) => state.notificationPreferences);
  const fetchNotificationPreferences = usePortalStore((state) => state.fetchNotificationPreferences);
  const updateNotificationPreferencesAsync = usePortalStore((state) => state.updateNotificationPreferencesAsync);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && !preferences) {
      void fetchNotificationPreferences();
    }
  }, [isOpen, preferences, fetchNotificationPreferences]);

  const update = async (patch: NotificationPreferencesUpdateSchema) => {
    setIsSaving(true);
    try {
      await updateNotificationPreferencesAsync(patch);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки уведомлений" widthClass="max-w-xl">
      {!preferences ? (
        <div className="py-8 text-center text-gray-500 text-sm">Загрузка настроек...</div>
      ) : (
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Каналы доставки
            </h3>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              <ToggleRow
                icon={<Globe className="w-4 h-4" />}
                title="Портал"
                description="Уведомления внутри портала"
                checked={Boolean(preferences.channel_portal)}
                onChange={(v) => update({ channel_portal: v })}
              />
              <ToggleRow
                icon={<Mail className="w-4 h-4" />}
                title="Email"
                description="Письма на корпоративную почту"
                checked={Boolean(preferences.channel_email)}
                onChange={(v) => update({ channel_email: v })}
              />
              <ToggleRow
                icon={<MessageCircle className="w-4 h-4" />}
                title="Мессенджер"
                description="Сообщения через Band бот"
                checked={Boolean(preferences.channel_messenger)}
                onChange={(v) => update({ channel_messenger: v })}
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Типы уведомлений
            </h3>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              <ToggleRow
                title="Новости"
                description="Публикации, обновления и обязательные новости"
                checked={Boolean(preferences.receive_news)}
                onChange={(v) => update({ receive_news: v })}
              />
              <ToggleRow
                title="Документы"
                description="Новые документы, версии и назначения на ознакомление"
                checked={Boolean(preferences.receive_documents)}
                onChange={(v) => update({ receive_documents: v })}
              />
              <ToggleRow
                title="Комментарии"
                description="Ответы и упоминания в комментариях"
                checked={Boolean(preferences.receive_comments)}
                onChange={(v) => update({ receive_comments: v })}
              />
              <ToggleRow
                title="Дни рождения"
                description="Напоминания о днях рождения коллег"
                checked={Boolean(preferences.receive_birthdays)}
                onChange={(v) => update({ receive_birthdays: v })}
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Дополнительно
            </h3>
            <div className="rounded-lg border border-gray-200">
              <ToggleRow
                icon={<Bell className="w-4 h-4" />}
                title="Ежедневная сводка"
                description="Получать дайджест событий раз в день"
                checked={Boolean(preferences.digest_daily)}
                onChange={(v) => update({ digest_daily: v })}
              />
            </div>
          </section>

          {isSaving && <p className="text-xs text-gray-400 text-right">Сохранение...</p>}
        </div>
      )}
    </Modal>
  );
};

export default NotificationPreferencesModal;
