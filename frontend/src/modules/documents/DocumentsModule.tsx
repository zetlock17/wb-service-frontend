import { ChevronRight, Download, Eye, FileText, Folder, FolderOpen, Plus, Home, Trash2, Edit, Check, X, CalendarClock } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AlertModal from "../../components/common/AlertModal";
import Modal from "../../components/common/Modal";
import {
  createFolder,
  deleteFolder,
  deleteDocument,
  getDocumentDownloadUrl,
  getDocuments,
  getFoldersTree,
  updateDocument,
  updateFolder,
  uploadDocument,
  type Document,
  type FolderTree,
} from "../../api/documentsApi";
import { getProfilesList } from "../../api/profileApi";
import { useAlert } from "../../hooks/useAlert";
import usePortalStore from "../../store/usePortalStore";

const statusLabels: Record<Document["status"], string> = {
  DRAFT: "Черновик",
  PUBLISHED: "Актуален",
  ARCHIVED: "Архивный",
};

const statusBadgeClasses: Record<Document["status"], string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-700",
};

const documentTypeLabels: Record<string, string> = {
  regulation: "Регламент",
  policy: "Политика",
  instruction: "Инструкция",
  order: "Приказ",
  procedure: "Процедура",
  standard: "Стандарт",
  memo: "Памятка",
  guide: "Руководство",
};

const extractDownloadUrl = (value: unknown): string | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as Record<string, unknown>;
  const candidates = ["url", "download_url", "downloadUrl", "link", "signed_url"];

  for (const key of candidates) {
    const candidate = data[key];
    if (typeof candidate === "string" && candidate) {
      return candidate;
    }
  }

  return null;
};

const formatDate = (value: string | null): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("ru-RU");
};

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDocumentType = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  return documentTypeLabels[normalized] || value;
};

interface BrowserFolder {
  id: number;
  name: string;
  path: string;
  parent_id: number | null;
}

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

  const foldersById = useMemo(() => new Map(folders.map((folder) => [folder.id, folder])), [folders]);

  const childrenByParent = useMemo(() => {
    const map = new Map<number | null, BrowserFolder[]>();

    for (const folder of folders) {
      const current = map.get(folder.parent_id) || [];
      current.push(folder);
      map.set(folder.parent_id, current);
    }

    for (const [key, list] of map) {
      map.set(
        key,
        [...list].sort((a, b) => a.name.localeCompare(b.name, "ru-RU"))
      );
    }

    return map;
  }, [folders]);

  const getFolderPath = useCallback((folderId: number | null) => {
    if (folderId === null) {
      return [] as BrowserFolder[];
    }

    const path: BrowserFolder[] = [];
    let currentId: number | null = folderId;

    while (currentId !== null) {
      const folder = foldersById.get(currentId);
      if (!folder) {
        break;
      }

      path.unshift(folder);
      currentId = folder.parent_id;
    }

    return path;
  }, [foldersById]);

  const activePath = useMemo(() => getFolderPath(activeFolderId), [activeFolderId, getFolderPath]);
  const activeChildren = useMemo(() => childrenByParent.get(activeFolderId) || [], [activeFolderId, childrenByParent]);
  const selectedFolderName =
    selectedFolderId === null ? rootLabel : foldersById.get(selectedFolderId)?.name || rootLabel;

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose} widthClass="max-w-3xl">
      <div className="space-y-4">
        <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900">
          Выбрано: <span className="font-semibold">{selectedFolderName}</span>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Текущая папка</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFolderId(null)}
              className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm ${
                activeFolderId === null
                  ? "border-purple-600 bg-purple-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Home className="h-4 w-4" />
              {rootLabel}
            </button>
            {activePath.map((folder) => (
              <div key={`breadcrumb-${folder.id}`} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setActiveFolderId(folder.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
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

        <div className="rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-4 py-3">
            <button
              type="button"
              onClick={() => setSelectedFolderId(activeFolderId)}
              className="rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-900 hover:bg-purple-100"
            >
              Выбрать текущую папку
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto px-2 py-2">
            {!activeChildren.length ? (
              <p className="px-2 py-4 text-sm text-gray-500">В этой папке нет подпапок</p>
            ) : (
              <div className="space-y-2">
                {activeChildren.map((folder) => {
                  const isSelected = selectedFolderId === folder.id;

                  return (
                    <div
                      key={`picker-folder-${folder.id}`}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                        isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{folder.name}</p>
                        <p className="truncate text-xs text-gray-500">{folder.path}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedFolderId(folder.id)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Выбрать
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveFolderId(folder.id)}
                          className="rounded-md bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-700"
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
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedFolderId)}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Применить
          </button>
        </div>
      </div>
    </Modal>
  );
};

const flattenFolderTree = (nodes: FolderTree[], parentId: number | null = null): BrowserFolder[] => {
  const result: BrowserFolder[] = [];

  for (const node of nodes) {
    result.push({
      id: node.id,
      name: node.name,
      path: node.path,
      parent_id: parentId,
    });

    if (node.children.length) {
      result.push(...flattenFolderTree(node.children, node.id));
    }
  }

  return result;
};

const DocumentsModule = () => {
  const { currentUser, roles } = usePortalStore();
  const isAdmin = roles.includes("admin");
  const currentEid = String(currentUser?.eid || "");

  const [activeTab, setActiveTab] = useState<"all" | "mine" | "recent">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [folders, setFolders] = useState<BrowserFolder[]>([]);
  const [folderManagerId, setFolderManagerId] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParentId, setNewFolderParentId] = useState<number | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [folderActionLoading, setFolderActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeFolderPicker, setActiveFolderPicker] = useState<
    "current" | "new-parent" | "manage" | "upload" | null
  >(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFolderId, setUploadFolderId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [recentDocumentIds, setRecentDocumentIds] = useState<number[]>([]);
  const [readDocumentIds, setReadDocumentIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem("readDocuments");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [editingDocumentData, setEditingDocumentData] = useState<{
    title: string;
    description: string;
    status: Document["status"];
    curator_id: string | null;
  }>({
    title: "",
    description: "",
    status: "DRAFT",
    curator_id: null,
  });
  const [documentActionLoading, setDocumentActionLoading] = useState(false);
  const { alertState, showAlert, closeAlert } = useAlert();
  const initialLoadRef = useRef(false);

  const isAnyDocumentCurator = useMemo(
    () => documents.some((doc) => String(doc.curator_id || "") === currentEid),
    [currentEid, documents]
  );

  const canManageDocuments = isAdmin || isAnyDocumentCurator;

  const canManageSelectedDocument = useMemo(() => {
    if (!selectedDocument) {
      return isAdmin;
    }

    return isAdmin || String(selectedDocument.curator_id || "") === currentEid;
  }, [currentEid, isAdmin, selectedDocument]);

  const getFolderPath = useCallback((folderId: number | null): BrowserFolder[] => {
    const path: BrowserFolder[] = [];
    let currentId = folderId;

    while (currentId !== null) {
      const folder = folders.find((f) => f.id === currentId);
      if (!folder) break;
      path.unshift(folder);
      currentId = folder.parent_id;
    }

    return path;
  }, [folders]);

  const getFolderDisplayName = useCallback(
    (folderId: number | null, rootLabel: string) => {
      if (folderId === null) {
        return rootLabel;
      }

      return folders.find((item) => item.id === folderId)?.name || rootLabel;
    },
    [folders]
  );

  const folderPickerConfig = useMemo(() => {
    if (activeFolderPicker === null) {
      return null;
    }

    if (activeFolderPicker === "current") {
      return {
        title: "Выбор текущей папки",
        rootLabel: "Корень",
        initialValue: currentFolderId,
      };
    }

    if (activeFolderPicker === "new-parent") {
      return {
        title: "Выбор родительской папки",
        rootLabel: "Корень",
        initialValue: newFolderParentId,
      };
    }

    if (activeFolderPicker === "manage") {
      return {
        title: "Выбор папки для управления",
        rootLabel: "Не выбрано",
        initialValue: folderManagerId,
      };
    }

    return {
      title: "Выбор папки для документа",
      rootLabel: "Без папки",
      initialValue: uploadFolderId,
    };
  }, [activeFolderPicker, currentFolderId, folderManagerId, newFolderParentId, uploadFolderId]);

  const onFolderPickerConfirm = async (value: number | null) => {
    if (!activeFolderPicker) {
      return;
    }

    const pickerType = activeFolderPicker;
    setActiveFolderPicker(null);

    if (pickerType === "current") {
      setCurrentFolderId(value);
      await fetchDocumentsByFolder(value);
      return;
    }

    if (pickerType === "new-parent") {
      setNewFolderParentId(value);
      return;
    }

    if (pickerType === "manage") {
      setFolderManagerId(value);
      const folder = folders.find((item) => item.id === value);
      setRenameFolderName(folder?.name || "");
      return;
    }

    setUploadFolderId(value);
  };

  const getFolderContents = useCallback(
    (folderId: number | null) => {
      const docs = documents.filter((doc) => doc.folder_id === folderId).length;
      const subs = folders.filter((folder) => folder.parent_id === folderId).length;
      return { docs, subs };
    },
    [documents, folders]
  );

  const saveReadDocument = useCallback((docId: number) => {
    const newReadIds = new Set(readDocumentIds);
    newReadIds.add(docId);
    setReadDocumentIds(newReadIds);
    localStorage.setItem("readDocuments", JSON.stringify(Array.from(newReadIds)));
  }, [readDocumentIds]);

  const fetchFolders = useCallback(async () => {
    const foldersResponse = await getFoldersTree();

    if (foldersResponse.status >= 200 && foldersResponse.status < 300) {
      const flatFolders = flattenFolderTree(foldersResponse.data || []);
      setFolders(flatFolders);
      setFolderManagerId((prev) =>
        prev !== null && !flatFolders.some((folder) => folder.id === prev) ? null : prev
      );
      setCurrentFolderId((prev) =>
        prev !== null && !flatFolders.some((folder) => folder.id === prev) ? null : prev
      );
      setNewFolderParentId((prev) =>
        prev !== null && !flatFolders.some((folder) => folder.id === prev) ? null : prev
      );
      setUploadFolderId((prev) =>
        prev !== null && !flatFolders.some((folder) => folder.id === prev) ? null : prev
      );
      return true;
    }

    showAlert(foldersResponse.message || "Не удалось загрузить папки", "error");
    return false;
  }, [showAlert]);

  const fetchProfilesMap = useCallback(async () => {
    const pageSize = 100;
    const maxPages = 100;
    const profiles: Array<{ eid: string; full_name: string }> = [];

    for (let page = 1; page <= maxPages; page += 1) {
      const profilesResponse = await getProfilesList({ page, size: pageSize });

      if (profilesResponse.status < 200 || profilesResponse.status >= 300) {
        break;
      }

      const currentPage = profilesResponse.data || [];
      profiles.push(...currentPage);

      if (currentPage.length < pageSize) {
        break;
      }
    }

    const map = profiles.reduce<Record<string, string>>((acc, profile) => {
      const key = String(profile.eid);
      if (key) {
        acc[key] = profile.full_name;
      }
      return acc;
    }, {});

    setProfilesMap(map);
  }, []);

  const getPersonDisplayName = useCallback(
    (eid: string | null | undefined) => {
      if (!eid) {
        return "-";
      }

      return profilesMap[String(eid)] || String(eid);
    },
    [profilesMap]
  );

  const fetchDocumentsByFolder = useCallback(
    async (folderId: number | null) => {
      if (!initialLoadRef.current) {
        return;
      }

      setDocumentsLoading(true);
      const docsResponse = await getDocuments({
        folder_id: folderId,
        page: 1,
        size: 100,
      });
      setDocumentsLoading(false);

      if (docsResponse.status >= 200 && docsResponse.status < 300) {
        setDocuments(docsResponse.data || []);
        return;
      }

      setDocuments([]);
      showAlert(docsResponse.message || "Не удалось загрузить документы", "error");
    },
    [showAlert]
  );

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([fetchFolders(), fetchProfilesMap()]);
      initialLoadRef.current = true;
      await fetchDocumentsByFolder(null);
      setLoading(false);
    };

    void initialize();
  }, [fetchDocumentsByFolder, fetchFolders, fetchProfilesMap]);

  const navigateToFolder = useCallback(
    async (folderId: number | null) => {
      setCurrentFolderId(folderId);
      await fetchDocumentsByFolder(folderId);
    },
    [fetchDocumentsByFolder]
  );

  const types = useMemo(() => ["all", ...new Set(documents.map((doc) => doc.type))], [documents]);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (activeTab === "mine") {
      const currentEid = String(currentUser?.eid || "");
      result = result.filter(
        (doc) => String(doc.author_id) === currentEid || String(doc.curator_id || "") === currentEid
      );
    }

    if (activeTab === "recent") {
      result = result.filter((doc) => recentDocumentIds.includes(doc.id));
      result = [...result].sort(
        (a, b) => recentDocumentIds.indexOf(a.id) - recentDocumentIds.indexOf(b.id)
      );
    }

    result = result.filter((doc) => (doc.folder_id ?? null) === currentFolderId);

    if (documentFilter !== "all") {
      result = result.filter((doc) => doc.type === documentFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.original_filename.toLowerCase().includes(query) ||
          (doc.description || "").toLowerCase().includes(query)
      );
    }

    return result;
  }, [activeTab, currentFolderId, currentUser?.eid, documentFilter, documents, recentDocumentIds, searchQuery]);

  const childFolders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = folders.filter((folder) => folder.parent_id === currentFolderId);

    if (!query) {
      return result;
    }

    return result.filter((folder) => folder.name.toLowerCase().includes(query));
  }, [currentFolderId, folders, searchQuery]);

  const resetUploadForm = useCallback(() => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setUploadFolderId(null);
  }, []);

  const onUploadClick = () => {
    if (!canManageDocuments) {
      showAlert("Действие доступно только администратору или куратору документа", "warning");
      return;
    }

    resetUploadForm();
    if (currentFolderId !== null) {
      setUploadFolderId(currentFolderId);
    }
    setIsUploadModalOpen(true);
  };

  const onUploadSubmit = async () => {
    if (!uploadFile) {
      showAlert("Выберите файл для загрузки", "warning");
      return;
    }

    const title = uploadTitle.trim() || uploadFile.name;
    const description = uploadDescription.trim();
    const folderId = uploadFolderId;

    setUploading(true);
    const response = await uploadDocument(uploadFile, {
      title,
      description: description || undefined,
      folder_id: folderId,
    });
    setUploading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Документ успешно загружен", "success");
      setIsUploadModalOpen(false);
      resetUploadForm();
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }

    showAlert(response.message || "Не удалось загрузить документ", "error");
  };

  const onDownloadDocument = async (docId: number) => {
    setDownloadingId(docId);
    const response = await getDocumentDownloadUrl(docId);
    setDownloadingId(null);

    if (response.status < 200 || response.status >= 300) {
      showAlert(response.message || "Не удалось получить ссылку на скачивание", "error");
      return;
    }

    const url = extractDownloadUrl(response.data);
    if (!url) {
      showAlert("Ссылка на скачивание не найдена в ответе API", "error");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onSelectDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setRecentDocumentIds((prev) => {
      const withoutCurrent = prev.filter((id) => id !== doc.id);
      return [doc.id, ...withoutCurrent].slice(0, 20);
    });
  };

  const onOpenFolder = async (folderId: number) => {
    await navigateToFolder(folderId);
  };

  const onCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      showAlert("Введите название папки", "warning");
      return;
    }

    setFolderActionLoading(true);
    const response = await createFolder({
      name,
      parent_id: newFolderParentId,
    });
    setFolderActionLoading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Папка создана", "success");
      setNewFolderName("");
      await fetchFolders();
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }

    showAlert(response.message || "Не удалось создать папку", "error");
  };

  const onRenameFolder = async () => {
    if (folderManagerId === null) {
      showAlert("Выберите папку для переименования", "warning");
      return;
    }

    const name = renameFolderName.trim();
    if (!name) {
      showAlert("Введите новое название папки", "warning");
      return;
    }

    setFolderActionLoading(true);
    const response = await updateFolder(folderManagerId, { name });
    setFolderActionLoading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Название папки обновлено", "success");
      await fetchFolders();
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }

    showAlert(response.message || "Не удалось переименовать папку", "error");
  };

  const onDeleteFolder = async () => {
    if (folderManagerId === null) {
      showAlert("Выберите папку для удаления", "warning");
      return;
    }

    const folder = folders.find((item) => item.id === folderManagerId);
    const isConfirmed = window.confirm(
      `Удалить папку "${folder?.name || "Без названия"}"? Эта операция необратима.`
    );

    if (!isConfirmed) {
      return;
    }

    setFolderActionLoading(true);
    const response = await deleteFolder(folderManagerId);
    setFolderActionLoading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Папка удалена", "success");
      setFolderManagerId(null);
      setRenameFolderName("");
      await fetchFolders();
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }

    showAlert(response.message || "Не удалось удалить папку", "error");
  };

  const onEditDocument = async () => {
    if (!selectedDocument) {
      return;
    }

    setDocumentActionLoading(true);
    const response = await updateDocument(selectedDocument.id, {
      title: editingDocumentData.title || undefined,
      description: editingDocumentData.description || undefined,
      status: editingDocumentData.status,
      curator_id: editingDocumentData.curator_id || undefined,
    });
    setDocumentActionLoading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Документ обновлен", "success");
      setIsEditingDocument(false);
      setSelectedDocument(response.data);
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }

    showAlert(response.message || "Не удалось обновить документ", "error");
  };

  const onDeleteDocument = async () => {
    if (!selectedDocument) {
      return;
    }

    const isConfirmed = window.confirm(
      `Удалить документ "${selectedDocument.title}"? Эта операция необратима.`
    );

    if (!isConfirmed) {
      return;
    }

    setDocumentActionLoading(true);
    const response = await deleteDocument(selectedDocument.id);
    setDocumentActionLoading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Документ удален", "success");
      setSelectedDocument(null);
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }

    showAlert(response.message || "Не удалось удалить документ", "error");
  };

  const onMarkAsRead = () => {
    if (!selectedDocument) {
      return;
    }

    saveReadDocument(selectedDocument.id);
    showAlert("Документ отмечен как прочитанный", "success");
  };

  const onStartEditingDocument = () => {
    if (!selectedDocument) {
      return;
    }

    setEditingDocumentData({
      title: selectedDocument.title,
      description: selectedDocument.description || "",
      status: selectedDocument.status,
      curator_id: selectedDocument.curator_id,
    });
    setIsEditingDocument(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Управление документами</h2>
          {canManageDocuments && (
            <button
              onClick={onUploadClick}
              disabled={uploading || folderActionLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {uploading ? "Загрузка..." : "Добавить документ"}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              activeTab === "all" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Все документы
          </button>
          <button
            onClick={() => setActiveTab("mine")}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              activeTab === "mine" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Мои документы
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              activeTab === "recent" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Недавно просмотренные
          </button>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Поиск по названию, содержимому..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => setActiveFolderPicker("current")}
            className="min-w-72 rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
          >
            <span className="block text-xs text-gray-500">Текущая папка</span>
            <span className="block truncate font-medium text-gray-900">
              {getFolderDisplayName(currentFolderId, "Корень")}
            </span>
          </button>
          <select
            value={documentFilter}
            onChange={(event) => setDocumentFilter(event.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Все типы</option>
            {types
              .filter((type) => type !== "all")
              .map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
          </select>
        </div>

          {canManageDocuments && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Работа с папками</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Новая папка</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(event) => setNewFolderName(event.target.value)}
                    placeholder="Введите название папки"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Родитель</label>
                  <button
                    type="button"
                    onClick={() => setActiveFolderPicker("new-parent")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <span className="block text-xs text-gray-500">Родительская папка</span>
                    <span className="block truncate text-sm font-medium text-gray-900">
                      {getFolderDisplayName(newFolderParentId, "Корень")}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onCreateFolder}
                  disabled={folderActionLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
                >
                  Создать папку
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Выберите папку</label>
                  <button
                    type="button"
                    onClick={() => setActiveFolderPicker("manage")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <span className="block text-xs text-gray-500">Папка для управления</span>
                    <span className="block truncate text-sm font-medium text-gray-900">
                      {getFolderDisplayName(folderManagerId, "Не выбрано")}
                    </span>
                  </button>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Новое название</label>
                  <input
                    type="text"
                    value={renameFolderName}
                    onChange={(event) => setRenameFolderName(event.target.value)}
                    placeholder="Введите новое название"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={onRenameFolder}
                  disabled={folderActionLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-60"
                >
                  Переименовать
                </button>
                <button
                  onClick={onDeleteFolder}
                  disabled={folderActionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}

          {/* Красивая навигация по папкам */}
          <div className="mb-4 px-1 py-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => void navigateToFolder(null)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  currentFolderId === null
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Home className="w-4 h-4" />
                Корень
              </button>
              {getFolderPath(currentFolderId).map((folder) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => void navigateToFolder(folder.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                    title={folder.path}
                  >
                    <Folder className="w-4 h-4" />
                    <span>{folder.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        <div className="space-y-3">
          {documentsLoading && (
            <p className="text-sm text-gray-500 px-1">Загружаем документы выбранной папки...</p>
          )}

            {childFolders.map((folder) => {
              const { docs, subs } = getFolderContents(folder.id);
              return (
                <button
                  key={`folder-${folder.id}`}
                  onClick={() => void onOpenFolder(folder.id)}
                  className="w-full border border-blue-200 bg-blue-50/50 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FolderOpen className="w-5 h-5 text-blue-700 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                          {(docs > 0 || subs > 0) ? (
                            <>
                              {docs > 0 && (
                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                                  <FileText className="w-3 h-3" />
                                  {docs} {docs === 1 ? "документ" : "документов"}
                                </span>
                              )}
                              {subs > 0 && (
                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                                  <Folder className="w-3 h-3" />
                                  {subs} {subs === 1 ? "папка" : "папок"}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Папка пуста</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </div>
                </button>
              );
            })}

          {filteredDocuments.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="w-full border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${statusBadgeClasses[doc.status]}`}
                    >
                      {statusLabels[doc.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Тип: {formatDocumentType(doc.type)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Folder className="w-4 h-4" />
                      {folders.find((item) => item.id === doc.folder_id)?.name || "Без папки"}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarClock className="w-4 h-4" />
                      Выкладка: {formatDateTime(doc.created_at)}
                    </span>
                    <span>{getPersonDisplayName(doc.author_id)}</span>
                    <span>v{doc.current_version}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      -
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
          {!filteredDocuments.length && !childFolders.length && (
            <p className="text-center text-gray-500 py-8">В текущей папке пока нет ни документов, ни вложенных папок</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isUploadModalOpen}
        title="Загрузка документа"
        onClose={() => {
          setIsUploadModalOpen(false);
          resetUploadForm();
        }}
        widthClass="max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Файл</label>
            <input
              type="file"
              onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {uploadFile && <p className="text-xs text-gray-500 mt-1">Выбрано: {uploadFile.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название документа</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(event) => setUploadTitle(event.target.value)}
              placeholder="Если пусто, будет использовано имя файла"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={uploadDescription}
              onChange={(event) => setUploadDescription(event.target.value)}
              rows={4}
              placeholder="Кратко опишите документ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Папка</label>
            <button
              type="button"
              onClick={() => setActiveFolderPicker("upload")}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left hover:bg-gray-50"
            >
              <span className="block text-xs text-gray-500">Папка для загрузки</span>
              <span className="block truncate text-sm font-medium text-gray-900">
                {getFolderDisplayName(uploadFolderId, "Без папки")}
              </span>
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                resetUploadForm();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              onClick={onUploadSubmit}
              disabled={uploading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
            >
              {uploading ? "Загрузка..." : "Загрузить"}
            </button>
          </div>
        </div>
      </Modal>

      {folderPickerConfig && (
        <FolderPickerModal
          isOpen={activeFolderPicker !== null}
          title={folderPickerConfig.title}
          folders={folders}
          initialValue={folderPickerConfig.initialValue}
          rootLabel={folderPickerConfig.rootLabel}
          onClose={() => setActiveFolderPicker(null)}
          onConfirm={(value) => {
            void onFolderPickerConfirm(value);
          }}
        />
      )}

      <Modal isOpen={Boolean(selectedDocument)} title={selectedDocument?.title ?? ""} onClose={() => {
        setSelectedDocument(null);
        setIsEditingDocument(false);
      }}>
        {selectedDocument && (
          <div className="space-y-4">
            {!isEditingDocument ? (
              <>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className={`px-3 py-1 rounded-full ${statusBadgeClasses[selectedDocument.status]}`}>
                    {statusLabels[selectedDocument.status]}
                  </span>
                  <span>Тип: {formatDocumentType(selectedDocument.type)}</span>
                  <span>Версия {selectedDocument.current_version}</span>
                  <span>{formatDate(selectedDocument.updated_at || selectedDocument.created_at)}</span>
                  {readDocumentIds.has(selectedDocument.id) && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Прочитано
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Автор</h3>
                  <p className="text-gray-600">{getPersonDisplayName(selectedDocument.author_id)}</p>
                </div>
                {selectedDocument.curator_id && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Куратор</h3>
                    <p className="text-gray-600">{getPersonDisplayName(selectedDocument.curator_id)}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Описание</h3>
                  <p className="text-gray-600">{selectedDocument.description || "Описание не заполнено"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Дата и время выкладки</h3>
                  <p className="text-gray-600">{formatDateTime(selectedDocument.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onDownloadDocument(selectedDocument.id)}
                    disabled={downloadingId === selectedDocument.id}
                    className="flex-1 min-w-44 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {downloadingId === selectedDocument.id ? "Получение ссылки..." : "Скачать"}
                  </button>
                  <button className="flex-1 min-w-44 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs truncate" title={selectedDocument.original_filename}>
                    📄 {selectedDocument.original_filename}
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs">
                    {selectedDocument.mime_type}
                  </button>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Статус бумаги</h3>
                  <button
                    onClick={onMarkAsRead}
                    disabled={readDocumentIds.has(selectedDocument.id)}
                    className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      readDocumentIds.has(selectedDocument.id)
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    {readDocumentIds.has(selectedDocument.id) ? "Вы отметили как прочитанный" : "Отметить как прочитанный"}
                  </button>
                </div>

                {canManageSelectedDocument && (
                  <>
                    <div className="pt-2 border-t border-gray-200 flex flex-wrap gap-3">
                      <button
                        onClick={onStartEditingDocument}
                        className="flex-1 min-w-32 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Редактировать
                      </button>
                      <button
                        onClick={onDeleteDocument}
                        disabled={documentActionLoading}
                        className="flex-1 min-w-32 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Удалить
                      </button>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Панель ознакомления</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-600">
                        <p>Это мета-документ требует ознакомления от сотрудников. Панель управления появится после подключения API ознакомления.</p>
                        <p className="mt-2 text-xs text-gray-500">Контакт: администратор системы</p>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">Редактирование документа</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    type="text"
                    value={editingDocumentData.title}
                    onChange={(e) =>
                      setEditingDocumentData({ ...editingDocumentData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                  <textarea
                    value={editingDocumentData.description}
                    onChange={(e) =>
                      setEditingDocumentData({ ...editingDocumentData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <select
                    value={editingDocumentData.status}
                    onChange={(e) =>
                      setEditingDocumentData({
                        ...editingDocumentData,
                        status: e.target.value as Document["status"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="DRAFT">Черновик</option>
                    <option value="PUBLISHED">Актуален</option>
                    <option value="ARCHIVED">Архивный</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Куратор</label>
                  <input
                    type="text"
                    value={editingDocumentData.curator_id || ""}
                    onChange={(e) =>
                      setEditingDocumentData({ ...editingDocumentData, curator_id: e.target.value || null })
                    }
                    placeholder="EID куратора"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={onEditDocument}
                    disabled={documentActionLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {documentActionLoading ? "Сохранение..." : "Сохранить"}
                  </button>
                  <button
                    onClick={() => setIsEditingDocument(false)}
                    disabled={documentActionLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <AlertModal {...alertState} onClose={closeAlert} />
    </div>
  );
};

export default DocumentsModule;
