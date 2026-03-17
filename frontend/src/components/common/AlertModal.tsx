import { useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  type?: AlertType;
  onClose: () => void;
}

const config: Record<
  AlertType,
  { icon: React.ElementType; iconClass: string; title: string; buttonClass: string }
> = {
  success: {
    icon: CheckCircle,
    iconClass: "text-green-500",
    title: "Успешно",
    buttonClass: "bg-green-600 hover:bg-green-700",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-red-500",
    title: "Ошибка",
    buttonClass: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-yellow-500",
    title: "Внимание",
    buttonClass: "bg-yellow-500 hover:bg-yellow-600",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    title: "Информация",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
  },
};

const AlertModal = ({ isOpen, message, type = "info", onClose }: AlertModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { icon: Icon, iconClass, title, buttonClass } = config[type];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${buttonClass}`}
          >
            ОК
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
