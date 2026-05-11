import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { getBirthdayTelegramLink } from "../../../api/birthdaysApi";
import Modal from "../../../components/common/Modal";
import type { Birthday } from "../../../types/portal";
import { formatBirthdayDate } from "../utils/dateUtils";

interface CongratulateModalProps {
  person: Birthday | null;
  onClose: () => void;
}

const CongratulateModal = ({ person, onClose }: CongratulateModalProps) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setMessage("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!person) return;
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Введите текст поздравления");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await getBirthdayTelegramLink(person.eid, trimmed);
      if (response.status >= 200 && response.status < 300 && response.data?.telegram_link) {
        window.open(response.data.telegram_link, "_blank", "noopener,noreferrer");
        reset();
        onClose();
      } else {
        setError(response.message || "Не удалось получить ссылку для поздравления");
      }
    } catch (err) {
      console.error("Failed to get telegram link:", err);
      setError("Ошибка при получении ссылки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={Boolean(person)} title="Поздравить коллегу" onClose={handleClose} widthClass="max-w-md">
      {person && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {person.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{person.full_name}</p>
              <p className="text-sm text-gray-600">{person.org_unit}</p>
              <p className="text-sm text-purple-600 font-medium">{formatBirthdayDate(person.birth_date)}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сообщение</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="С Днём рождения! Желаю..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="w-5 h-5" />
            {loading ? "Загрузка..." : "Поздравить в Telegram"}
          </button>
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Отмена
          </button>
        </div>
      )}
    </Modal>
  );
};

export default CongratulateModal;
