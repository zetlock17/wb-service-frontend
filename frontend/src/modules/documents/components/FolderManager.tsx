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
    <div className="overflow-hidden rounded-[28px] bg-white">
      <div className="grid grid-cols-2 border-b-2 border-gray-100">
        {(["create", "manage"] as const).map((tab) => {
          const Icon = tab === "create" ? FolderPlus : Settings2;
          const label = tab === "create" ? "Создать папку" : "Управление";
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative flex items-center justify-center gap-2.5 py-5 text-[16px] font-extrabold transition ${
                isActive
                  ? "bg-wb-pink-light text-wb-green"
                  : "bg-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-[3px] bg-wb-pink-dark" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-6 sm:p-7">
        {activeTab === "create" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_320px]">
            <div>
              <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">
                Название папки
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => onNewFolderNameChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onCreateFolder()}
                placeholder="Например: Регламенты 2024"
                className="w-full rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 placeholder:font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-wb-green transition"
              />
            </div>
            <div>
              <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">
                Родительская папка
              </label>
              <button
                type="button"
                onClick={onNewFolderParentPickerOpen}
                className="w-full rounded-full bg-wb-pink-light px-4 py-2 text-left transition hover:opacity-80"
              >
                <div className="text-[11px] font-semibold leading-tight text-gray-500">Родитель</div>
                <div className="truncate text-sm font-extrabold leading-tight text-gray-900">
                  {getFolderDisplayName(newFolderParentId, "Корень")}
                </div>
              </button>
            </div>
            <div className="flex justify-end md:col-span-2">
              <button
                type="button"
                onClick={onCreateFolder}
                disabled={folderActionLoading || !newFolderName.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-wb-green px-5 py-3.5 text-[15px] font-bold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              >
                {folderActionLoading ? "Создание..." : "Создать"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "manage" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[320px_1fr]">
            <div>
              <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">
                Папка
              </label>
              <button
                type="button"
                onClick={onFolderManagerPickerOpen}
                className="w-full rounded-full bg-wb-pink-light px-4 py-2 text-left transition hover:opacity-80"
              >
                <div className="text-[11px] font-semibold leading-tight text-gray-500">Выбранная папка</div>
                <div className="truncate text-sm font-extrabold leading-tight text-gray-900">
                  {getFolderDisplayName(folderManagerId, "Не выбрано")}
                </div>
              </button>
            </div>
            <div>
              <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">
                Новое название
              </label>
              <input
                type="text"
                value={renameFolderName}
                onChange={(e) => onRenameFolderNameChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onRenameFolder()}
                placeholder="Введите новое название"
                disabled={folderManagerId === null}
                className="w-full rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 placeholder:font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-wb-green transition disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2.5 md:col-span-2">
              <button
                type="button"
                onClick={onRenameFolder}
                disabled={folderActionLoading || folderManagerId === null || !renameFolderName.trim()}
                className="inline-flex items-center rounded-full bg-wb-pink-light px-5 py-3.5 text-[15px] font-bold text-wb-green transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              >
                {folderActionLoading ? "Сохранение..." : "Переименовать"}
              </button>
              <button
                type="button"
                onClick={onDeleteFolder}
                disabled={folderActionLoading || folderManagerId === null}
                className="inline-flex items-center rounded-full bg-red-600 px-5 py-3.5 text-[15px] font-bold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
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
