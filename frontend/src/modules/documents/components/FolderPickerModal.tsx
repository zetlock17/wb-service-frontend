import { ChevronRight, Home, Folder } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import Modal from "../../../components/common/Modal";
import type { BrowserFolder } from "../types";

interface FolderPickerModalProps {
  isOpen: boolean;
  title: string;
  folders: BrowserFolder[];
  initialValue: number | null;
  rootLabel: string;
  onClose: () => void;
  onConfirm: (value: number | null) => void;
}

const FolderPickerModal = ({
  isOpen,
  title,
  folders,
  initialValue,
  rootLabel,
  onClose,
  onConfirm,
}: FolderPickerModalProps) => {
  const [activeFolderId, setActiveFolderId] = useState<number | null>(initialValue);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(initialValue);

  const foldersById = useMemo(() => new Map(folders.map((f) => [f.id, f])), [folders]);

  const childrenByParent = useMemo(() => {
    const map = new Map<number | null, BrowserFolder[]>();
    for (const folder of folders) {
      const current = map.get(folder.parent_id) ?? [];
      current.push(folder);
      map.set(folder.parent_id, current);
    }
    for (const [key, list] of map) {
      map.set(key, [...list].sort((a, b) => a.name.localeCompare(b.name, "ru-RU")));
    }
    return map;
  }, [folders]);

  const getFolderPath = useCallback(
    (folderId: number | null): BrowserFolder[] => {
      if (folderId === null) return [];
      const path: BrowserFolder[] = [];
      let currentId: number | null = folderId;
      while (currentId !== null) {
        const folder = foldersById.get(currentId);
        if (!folder) break;
        path.unshift(folder);
        currentId = folder.parent_id;
      }
      return path;
    },
    [foldersById]
  );

  const activePath = useMemo(() => getFolderPath(activeFolderId), [activeFolderId, getFolderPath]);
  const activeChildren = useMemo(
    () => childrenByParent.get(activeFolderId) ?? [],
    [activeFolderId, childrenByParent]
  );
  const selectedFolderName =
    selectedFolderId === null ? rootLabel : foldersById.get(selectedFolderId)?.name ?? rootLabel;

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose} widthClass="max-w-2xl">
      <div className="space-y-4">
        <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900">
          Выбрано: <span className="font-semibold">{selectedFolderName}</span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Текущий путь</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFolderId(null)}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm transition ${
                activeFolderId === null
                  ? "border-purple-600 bg-purple-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              {rootLabel}
            </button>
            {activePath.map((folder) => (
              <div key={folder.id} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setActiveFolderId(folder.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-sm transition ${
                    activeFolderId === folder.id
                      ? "border-purple-600 bg-purple-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
            <button
              type="button"
              onClick={() => setSelectedFolderId(activeFolderId)}
              className="rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-sm font-medium text-purple-900 transition hover:bg-purple-50"
            >
              Выбрать текущую папку
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {!activeChildren.length ? (
              <p className="px-4 py-6 text-sm text-gray-500">Подпапок нет</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeChildren.map((folder) => {
                  const isSelected = selectedFolderId === folder.id;
                  return (
                    <div
                      key={folder.id}
                      className={`flex items-center justify-between gap-3 px-4 py-3 transition ${
                        isSelected ? "bg-purple-50" : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Folder className={`h-4 w-4 shrink-0 ${isSelected ? "text-purple-500" : "text-gray-400"}`} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{folder.name}</p>
                          <p className="truncate text-xs text-gray-400">{folder.path}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedFolderId(folder.id)}
                          className={`rounded-md border px-2 py-1 text-xs transition ${
                            isSelected
                              ? "border-purple-500 bg-purple-100 text-purple-700"
                              : "border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {isSelected ? "Выбрано" : "Выбрать"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveFolderId(folder.id)}
                          className="rounded-md bg-purple-600 px-2 py-1 text-xs text-white transition hover:bg-purple-700"
                        >
                          Открыть
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedFolderId)}
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
          >
            Применить
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FolderPickerModal;
