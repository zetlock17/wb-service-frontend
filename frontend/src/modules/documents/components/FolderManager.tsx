import { FolderPlus, Settings2 } from "lucide-react";
import { useState } from "react";
import type { BrowserFolder } from "../types";

interface FolderManagerProps {
  folders: BrowserFolder[];
  folderManagerId: number | null;
  renameFolderName: string;
  newFolderName: string;
  newFolderParentId: number | null;
  folderActionLoading: boolean;
  getFolderDisplayName: (id: number | null, rootLabel: string) => string;
  onNewFolderNameChange: (name: string) => void;
  onNewFolderParentPickerOpen: () => void;
  onCreateFolder: () => void;
  onFolderManagerPickerOpen: () => void;
  onRenameFolderNameChange: (name: string) => void;
  onRenameFolder: () => void;
  onDeleteFolder: () => void;
}

const FolderManager = ({
  folderManagerId,
  renameFolderName,
  newFolderName,
  newFolderParentId,
  folderActionLoading,
  getFolderDisplayName,
  onNewFolderNameChange,
  onNewFolderParentPickerOpen,
  onCreateFolder,
  onFolderManagerPickerOpen,
  onRenameFolderNameChange,
  onRenameFolder,
  onDeleteFolder,
}: FolderManagerProps) => {
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-purple-100 bg-white">
      <div className="flex border-b border-purple-100">
        <button
          type="button"
          onClick={() => setActiveTab("create")}
          className={`flex flex-1 items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition ${
            activeTab === "create"
              ? "border-b-2 border-purple-600 bg-purple-50 text-purple-700"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <FolderPlus className="h-4 w-4" />
          Создать папку
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manage")}
          className={`flex flex-1 items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition ${
            activeTab === "manage"
              ? "border-b-2 border-purple-600 bg-purple-50 text-purple-700"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <Settings2 className="h-4 w-4" />
          Управление
        </button>
      </div>

      <div className="p-5">
        {activeTab === "create" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Название папки</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => onNewFolderNameChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onCreateFolder()}
                  placeholder="Например: Регламенты 2024"
                  className="w-full rounded-xl border border-purple-100 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Родительская папка</label>
                <button
                  type="button"
                  onClick={onNewFolderParentPickerOpen}
                  className="w-full min-w-40 rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-left transition hover:bg-purple-50"
                >
                  <span className="block text-xs text-gray-400">Родитель</span>
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {getFolderDisplayName(newFolderParentId, "Корень")}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onCreateFolder}
                disabled={folderActionLoading || !newFolderName.trim()}
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {folderActionLoading ? "Создание..." : "Создать"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "manage" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Папка</label>
                <button
                  type="button"
                  onClick={onFolderManagerPickerOpen}
                  className="w-full min-w-44 rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-left transition hover:bg-purple-50"
                >
                  <span className="block text-xs text-gray-400">Выбранная папка</span>
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {getFolderDisplayName(folderManagerId, "Не выбрано")}
                  </span>
                </button>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Новое название</label>
                <input
                  type="text"
                  value={renameFolderName}
                  onChange={(e) => onRenameFolderNameChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onRenameFolder()}
                  placeholder="Введите новое название"
                  disabled={folderManagerId === null}
                  className="w-full rounded-xl border border-purple-100 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onRenameFolder}
                disabled={folderActionLoading || folderManagerId === null || !renameFolderName.trim()}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {folderActionLoading ? "Сохранение..." : "Переименовать"}
              </button>
              <button
                type="button"
                onClick={onDeleteFolder}
                disabled={folderActionLoading || folderManagerId === null}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Удалить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderManager;
