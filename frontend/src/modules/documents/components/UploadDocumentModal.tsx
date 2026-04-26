import { UploadCloud, FileText, X } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Modal from "../../../components/common/Modal";
import { documentTypeOptions } from "../constants";
import { isAllowedFile } from "../utils";
// import type { BrowserFolder } from "../types";

interface UploadDocumentModalProps {
  isOpen: boolean;
  uploading: boolean;
  uploadProgress: number | null;
  uploadFolderId: number | null;
  getFolderDisplayName: (id: number | null, rootLabel: string) => string;
  onClose: () => void;
  onFolderPickerOpen: () => void;
  onSubmit: (params: {
    file: File;
    title: string;
    description: string;
    type: string;
    folderId: number | null;
  }) => void;
  onValidationError: (message: string) => void;
}

const UploadDocumentModal = ({
  isOpen,
  uploading,
  uploadProgress,
  uploadFolderId,
  getFolderDisplayName,
  onClose,
  onFolderPickerOpen,
  onSubmit,
  onValidationError,
}: UploadDocumentModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (candidate: File) => {
    if (!isAllowedFile(candidate)) {
      if (candidate.size > 50 * 1024 * 1024) {
        onValidationError("Файл больше 50 МБ. Загрузите документ меньшего размера.");
      } else {
        onValidationError("Разрешены только DOCX, PDF, XLSX, JPG и PNG файлы.");
      }
      return;
    }
    setFile(candidate);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setTitle("");
    setDescription("");
    setType("");
    onClose();
  };

  const handleSubmit = () => {
    if (!file) {
      onValidationError("Выберите файл для загрузки");
      return;
    }
    if (!type) {
      onValidationError("Выберите тип документа");
      return;
    }
    onSubmit({ file, title, description, type, folderId: uploadFolderId });
  };

  return (
    <Modal isOpen={isOpen} title="Загрузка документа" onClose={handleClose} widthClass="max-w-2xl">
      <div className="space-y-5">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? "border-purple-400 bg-purple-50"
              : file
              ? "border-green-300 bg-green-50"
              : "cursor-pointer border-gray-300 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleInputChange}
            accept=".docx,.pdf,.xlsx,.jpg,.jpeg,.png"
            className="sr-only"
          />

          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 shrink-0 text-green-500" />
              <div className="min-w-0 text-left">
                <p className="truncate font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} МБ</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud className={`mx-auto mb-3 h-10 w-10 ${isDragging ? "text-purple-400" : "text-gray-400"}`} />
              <p className="text-sm font-medium text-gray-700">
                Перетащите файл или{" "}
                <span className="text-purple-600 underline underline-offset-2">выберите вручную</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">DOCX, PDF, XLSX, JPG, PNG · максимум 50 МБ</p>
            </>
          )}
        </div>

        {uploading && uploadProgress !== null && (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>Загрузка файла...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-purple-600 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Название <span className="font-normal text-gray-400">(необязательно)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Если пусто, будет использовано имя файла"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Тип документа <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
            >
              <option value="" disabled>
                Выберите тип
              </option>
              {documentTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Папка</label>
            <button
              type="button"
              onClick={onFolderPickerOpen}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-left transition hover:bg-gray-50"
            >
              <span className="block text-xs text-gray-400">Место хранения</span>
              <span className="block truncate text-sm font-medium text-gray-900">
                {getFolderDisplayName(uploadFolderId, "Без папки")}
              </span>
            </button>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Описание <span className="font-normal text-gray-400">(необязательно)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Кратко опишите содержание документа"
              className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading || !file}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UploadCloud className="h-4 w-4" />
            {uploading ? "Загрузка..." : "Загрузить"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadDocumentModal;
