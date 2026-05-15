import { Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import Modal from "../../../components/common/Modal";
import { useAlert } from "../../../hooks/useAlert";
import AlertModal from "../../../components/common/AlertModal";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string | null;
  avatarLoading: boolean;
  avatarError: string | null;
  updateAvatar: (file: File) => Promise<boolean>;
  deleteAvatar: () => Promise<boolean>;
}

const AvatarModal = ({
  isOpen,
  onClose,
  avatarUrl,
  avatarLoading,
  avatarError,
  updateAvatar,
  deleteAvatar,
}: AvatarModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { alertState, showAlert, closeAlert } = useAlert();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert("Пожалуйста, выберите файл изображения", "warning");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert("Размер файла не должен превышать 5MB", "warning");
      return;
    }

    const success = await updateAvatar(file);
    if (success) {
      onClose();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Вы уверены, что хотите удалить аватар?");
    if (!confirmed) return;
    const success = await deleteAvatar();
    if (success) onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} title="Управление фотографией профиля" onClose={onClose} widthClass="max-w-md">
        <div className="space-y-4">
          {avatarUrl && (
            <div className="flex justify-center">
              <img src={avatarUrl} alt="Текущая фотография" className="w-32 h-32 rounded-full object-cover" />
            </div>
          )}

          {avatarError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {avatarError}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="w-full px-4 py-3 bg-wb-green text-white rounded-lg hover:bg-wb-green-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {avatarUrl ? "Изменить фотографию" : "Загрузить фотографию"}
            </button>

            {avatarUrl && (
              <button
                onClick={handleDelete}
                disabled={avatarLoading}
                className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Удалить фотографию
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Рекомендуемый размер: 200x200 пикселей. Максимальный размер файла: 5MB
          </p>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Закрыть
          </button>
        </div>
      </Modal>
      <AlertModal {...alertState} onClose={closeAlert} />
    </>
  );
};

export default AvatarModal;
