import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
}

const Modal = ({ isOpen, title, onClose, children, widthClass = "max-w-3xl" }: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg w-full ${widthClass} max-h-[90vh] overflow-y-auto`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Закрыть модальное окно"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
