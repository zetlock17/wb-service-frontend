import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
}

const Modal = ({ isOpen, title, onClose, children, widthClass = "max-w-3xl" }: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="animate-wb-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`animate-wb-panel-in flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-gray-900/20 ${widthClass}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-7 py-5">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-wb-pink-light hover:text-wb-pink-dark"
            aria-label="Закрыть модальное окно"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto px-7 py-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;