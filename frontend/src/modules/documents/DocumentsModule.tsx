import { ChevronRight, Download, Eye, FileText, Folder, FolderOpen, Plus, Home, Trash2, Edit, Check, X, CalendarClock, Search, Files, UserRound, Clock3, FolderTree as FolderTreeIcon, Sparkles, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import AlertModal from "../../components/common/AlertModal";
import Modal from "../../components/common/Modal";
import {
  createFolder,
  deleteFolder,
  deleteDocument,
  archiveDocument,
  restoreDocument,
  searchDocuments,
  getDocumentDownloadUrl,
  downloadDocumentFile,
  downloadDocumentVersionFile,
  getDocuments,
  getDocumentVersionDownloadUrl,
  getDocumentVersions,
  getFoldersTree,
  uploadDocumentVersion,
  updateDocument,
  updateFolder,
  uploadDocument,
  type Document,
  type DocumentVersion,
  type FolderTree,
} from "../../api/documentsApi";
import DocumentPreviewModal from "./components/DocumentPreviewModal";
import { getProfileByEid } from "../../api/profileApi";
import { useAlert } from "../../hooks/useAlert";
import usePortalStore from "../../store/usePortalStore";

const statusLabels: Record<Document["status"], string> = {
  DRAFT: "Черновик",
  ACTIVE: "Действующий",
  PUBLISHED: "Действующий",
  ARCHIVED: "Архивный",
};

const statusBadgeClasses: Record<Document["status"], string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-green-100 text-green-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-red-100 text-red-700",
};

const documentTypeOptions = [
  { value: "REGULATION", label: "Регламент" },
  { value: "ORDER", label: "Приказ" },
  { value: "INSTRUCTION", label: "Указание" },
  { value: "CB_LETTER", label: "Письмо ЦБ" },
  { value: "MANUAL", label: "Инструкция" },
] as const;

const documentTypeValues = new Set<string>(documentTypeOptions.map((option) => option.value));

const documentTypeAliases: Record<string, (typeof documentTypeOptions)[number]["value"]> = {
  regulation: "REGULATION",
  reglement: "REGULATION",
  order: "ORDER",
  instruction: "INSTRUCTION",
  directive: "INSTRUCTION",
  cb_letter: "CB_LETTER",
  cbletter: "CB_LETTER",
  manual: "MANUAL",
  handbook: "MANUAL",
};

const documentTypeLabels: Record<string, string> = {
  REGULATION: "Регламент",
  ORDER: "Приказ",
  INSTRUCTION: "Указание",
  CB_LETTER: "Письмо ЦБ",
  MANUAL: "Инструкция",
};

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const allowedExtensions = new Set(["docx", "pdf", "xlsx", "jpg", "jpeg", "png"]);
const allowedMimeTypes = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
]);

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
  const normalizedValue = normalizeDocumentType(value);
  if (normalizedValue) {
    return documentTypeLabels[normalizedValue];
  }

  const normalized = value.trim().toLowerCase();
  return documentTypeLabels[normalized] || value;
};

const normalizeDocumentType = (value: string | null | undefined): (typeof documentTypeOptions)[number]["value"] | null => {
  if (!value) {
    return null;
  }

  if (documentTypeValues.has(value)) {
    return value as (typeof documentTypeOptions)[number]["value"];
  }

  const normalized = value.trim().toLowerCase();
  return documentTypeAliases[normalized] || null;
};

const getFileExtension = (fileName: string): string => {
  const parts = fileName.split(".");
  if (parts.length < 2) {
    return "";
  }
  return parts.pop()?.toLowerCase() || "";
};

const isAllowedFile = (file: File): boolean => {
  if (file.size > MAX_UPLOAD_SIZE) {
    return false;
  }

  const extension = getFileExtension(file.name);
  if (extension && allowedExtensions.has(extension)) {
    return true;
  }

  if (file.type && allowedMimeTypes.has(file.type)) {
    return true;
  }

  return false;
};

const saveBlobFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const extractFilenameFromDisposition = (contentDisposition: string | null): string | null => {
  if (!contentDisposition) {
    return null;
  }

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return null;
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
  const [showArchived, setShowArchived] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [searchStatus, setSearchStatus] = useState<Document["status"] | "all">("all");
  const [searchAuthorId, setSearchAuthorId] = useState("");
  const [searchCuratorId, setSearchCuratorId] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [searchResults, setSearchResults] = useState<Document[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
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
  const [uploadType, setUploadType] = useState<string>("");
  const [uploadFolderId, setUploadFolderId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [uploadVersionFile, setUploadVersionFile] = useState<File | null>(null);
  const [uploadVersionComment, setUploadVersionComment] = useState("");
  const [uploadVersionMajor, setUploadVersionMajor] = useState(false);
  const [uploadVersionProgress, setUploadVersionProgress] = useState<number | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [recentDocumentIds, setRecentDocumentIds] = useState<number[]>([]);
  const [readDocumentIds, setReadDocumentIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem("readDocuments");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [editingDocumentData, setEditingDocumentData] = useState<{
    title: string;
    type: string;
    description: string;
    status: Document["status"];
    curator_id: string | null;
  }>({
    title: "",
    type: "REGULATION",
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

  const fetchProfilesByEids = useCallback(
    async (eids: Array<string | null | undefined>) => {
      const uniqueEids = Array.from(
        new Set(
          eids
            .filter((eid): eid is string => Boolean(eid))
            .map((eid) => String(eid))
        )
      );

      const missing = uniqueEids.filter((eid) => !profilesMap[eid]);
      if (!missing.length) {
        return;
      }

      const responses = await Promise.all(missing.map((eid) => getProfileByEid(eid)));
      const nextEntries: Record<string, string> = {};

      responses.forEach((response, index) => {
        if (response.status >= 200 && response.status < 300 && response.data) {
          const eid = String(response.data.eid ?? missing[index]);
          if (eid) {
            nextEntries[eid] = response.data.full_name || eid;
          }
        }
      });

      if (Object.keys(nextEntries).length) {
        setProfilesMap((prev) => ({ ...prev, ...nextEntries }));
      }
    },
    [profilesMap]
  );

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
        show_archived: showArchived,
        page: 1,
        size: 100,
      });
      setDocumentsLoading(false);

      if (docsResponse.status >= 200 && docsResponse.status < 300) {
        const nextDocuments = docsResponse.data || [];
        setDocuments(nextDocuments);
        void fetchProfilesByEids(
          nextDocuments.flatMap((doc) => [doc.author_id, doc.curator_id])
        );
        return;
      }

      setDocuments([]);
      showAlert(docsResponse.message || "Не удалось загрузить документы", "error");
    },
    [fetchProfilesByEids, showAlert, showArchived]
  );

  const fetchDocumentVersions = useCallback(
    async (docId: number) => {
      setVersionsLoading(true);
      const response = await getDocumentVersions(docId);
      setVersionsLoading(false);

      if (response.status >= 200 && response.status < 300) {
        const versions = response.data || [];
        const sorted = [...versions].sort((a, b) => b.id - a.id);
        setDocumentVersions(sorted);
        void fetchProfilesByEids(sorted.map((version) => version.uploaded_by));
        return;
      }

      setDocumentVersions([]);
      showAlert(response.message || "Не удалось загрузить историю версий", "error");
    },
    [fetchProfilesByEids, showAlert]
  );

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchFolders();
      initialLoadRef.current = true;
      await fetchDocumentsByFolder(null);
      setLoading(false);
    };

    void initialize();
  }, [fetchDocumentsByFolder, fetchFolders]);

  useEffect(() => {
    if (!initialLoadRef.current) {
      return;
    }

    void fetchDocumentsByFolder(currentFolderId);
  }, [currentFolderId, fetchDocumentsByFolder, showArchived]);


  const navigateToFolder = useCallback(
    async (folderId: number | null) => {
      setCurrentFolderId(folderId);
      await fetchDocumentsByFolder(folderId);
    },
    [fetchDocumentsByFolder]
  );

  const types = useMemo(() => ["all", ...documentTypeOptions.map((option) => option.value)], []);

  const executeSearch = useCallback(async () => {
    const hasSearchFilters =
      searchQuery.trim() ||
      documentFilter !== "all" ||
      searchStatus !== "all" ||
      searchAuthorId.trim() ||
      searchCuratorId.trim() ||
      searchDateFrom ||
      searchDateTo;

    if (!hasSearchFilters) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    const response = await searchDocuments({
      q: searchQuery.trim() || null,
      doc_type: documentFilter !== "all" ? documentFilter : null,
      status: searchStatus !== "all" ? (searchStatus as Document["status"]) : null,
      author_id: searchAuthorId.trim() || null,
      curator_id: searchCuratorId.trim() || null,
      date_from: searchDateFrom || null,
      date_to: searchDateTo || null,
      show_archived: showArchived,
      size: 100,
    });
    setIsSearching(false);

    if (response.status >= 200 && response.status < 300) {
      const results = response.data || [];
      setSearchResults(results);
      void fetchProfilesByEids(results.flatMap((doc) => [doc.author_id, doc.curator_id]));
    } else {
      showAlert(response.message || "Ошибка при поиске документов", "error");
    }
  }, [
    searchQuery,
    documentFilter,
    searchStatus,
    searchAuthorId,
    searchCuratorId,
    searchDateFrom,
    searchDateTo,
    showArchived,
    fetchProfilesByEids,
    showAlert,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void executeSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [executeSearch]);

  const filteredDocuments = useMemo(() => {
    let result = searchResults !== null ? searchResults : documents;

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

    if (searchResults === null) {
      result = result.filter((doc) => (doc.folder_id ?? null) === currentFolderId);

      if (!showArchived) {
        result = result.filter((doc) => doc.status !== "ARCHIVED");
      }

      if (documentFilter !== "all") {
        result = result.filter((doc) => normalizeDocumentType(doc.type) === documentFilter);
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
    }

    return result;
  }, [activeTab, currentFolderId, currentUser?.eid, documentFilter, documents, recentDocumentIds, searchQuery, searchResults, showArchived]);

  const childFolders = useMemo(() => {
    if (searchResults !== null) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();
    const result = folders.filter((folder) => folder.parent_id === currentFolderId);

    if (!query) {
      return result;
    }

    return result.filter((folder) => folder.name.toLowerCase().includes(query));
  }, [currentFolderId, folders, searchQuery, searchResults]);

  const tabItems = useMemo(
    () => [
      { id: "all" as const, label: "Все документы", icon: Files },
      { id: "mine" as const, label: "Мои", icon: UserRound },
      { id: "recent" as const, label: "Недавние", icon: Clock3 },
    ],
    []
  );

  const overviewStats = useMemo(() => {
    const docsInCurrentFolder = documents.filter((doc) => (doc.folder_id ?? null) === currentFolderId);
    const unreadCount = docsInCurrentFolder.filter((doc) => !readDocumentIds.has(doc.id)).length;

    return [
      {
        label: "Документов",
        value: docsInCurrentFolder.length,
        hint: "в выбранной папке",
        icon: FileText,
      },
      {
        label: "Подпапок",
        value: childFolders.length,
        hint: "на текущем уровне",
        icon: FolderTreeIcon,
      },
      {
        label: "Не прочитано",
        value: unreadCount,
        hint: "требуют внимания",
        icon: Eye,
      },
      {
        label: "Недавние",
        value: recentDocumentIds.length,
        hint: "история просмотра",
        icon: Clock3,
      },
    ];
  }, [childFolders.length, currentFolderId, documents, readDocumentIds, recentDocumentIds.length]);

  const resetUploadForm = useCallback(() => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setUploadType("");
    setUploadFolderId(null);
    setUploadProgress(null);
  }, []);

  const validateFileForUpload = useCallback(
    (file: File) => {
      if (file.size > MAX_UPLOAD_SIZE) {
        showAlert("Файл больше 50 МБ. Загрузите документ меньшего размера.", "warning");
        return false;
      }

      if (!isAllowedFile(file)) {
        showAlert("Разрешены только DOCX, PDF, XLSX, JPG и PNG файлы.", "warning");
        return false;
      }

      return true;
    },
    [showAlert]
  );

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

  const onUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setUploadFile(null);
      return;
    }

    if (!validateFileForUpload(file)) {
      event.target.value = "";
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  const onUploadVersionFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setUploadVersionFile(null);
      return;
    }

    if (!validateFileForUpload(file)) {
      event.target.value = "";
      setUploadVersionFile(null);
      return;
    }

    setUploadVersionFile(file);
  };

  const onUploadSubmit = async () => {
    if (!uploadFile) {
      showAlert("Выберите файл для загрузки", "warning");
      return;
    }

    if (!validateFileForUpload(uploadFile)) {
      return;
    }

    if (!uploadType) {
      showAlert("Выберите тип документа", "warning");
      return;
    }

    const title = uploadTitle.trim() || uploadFile.name;
    const description = uploadDescription.trim();
    const folderId = uploadFolderId;

    setUploading(true);
    setUploadProgress(0);
    const response = await uploadDocument(
      uploadFile,
      {
        title,
        type: uploadType,
        description: description || undefined,
        folder_id: folderId,
      },
      {
        onProgress: (progress) => setUploadProgress(progress),
      }
    );
    setUploading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Документ успешно загружен", "success");
      setIsUploadModalOpen(false);
      resetUploadForm();
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }
    setUploadProgress(null);
    showAlert(response.message || "Не удалось загрузить документ", "error");
  };

  const onDownloadDocument = async (docId: number) => {
    setDownloadingId(docId);
    try {
      const response = await getDocumentDownloadUrl(docId);
      const url = response.status >= 200 && response.status < 300 ? extractDownloadUrl(response.data) : null;

      if (url) {
        const fileResponse = await fetch(url);
        if (!fileResponse.ok) {
          throw new Error("Не удалось скачать файл по ссылке");
        }
        const blob = await fileResponse.blob();
        const filenameFromHeader = extractFilenameFromDisposition(fileResponse.headers.get("content-disposition"));
        const filename = filenameFromHeader || selectedDocument?.original_filename || "document";
        saveBlobFile(blob, filename);
        return;
      }

      const blobResponse = await downloadDocumentFile(docId);
      if (blobResponse.status < 200 || blobResponse.status >= 300) {
        throw new Error(blobResponse.message || "Не удалось скачать документ");
      }
      const filename = blobResponse.filename || selectedDocument?.original_filename || "document";
      saveBlobFile(blobResponse.data, filename);
    } catch (error: any) {
      showAlert(error?.message || "Не удалось скачать документ", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const closePreview = useCallback(() => {
    setPreviewDocument(null);
  }, []);

  const onOpenPreview = (doc: Document) => {
    setPreviewDocument(doc);
  };

  const onSelectDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setUploadVersionFile(null);
    setUploadVersionComment("");
    setUploadVersionMajor(false);
    void fetchDocumentVersions(doc.id);
    void fetchProfilesByEids([doc.author_id, doc.curator_id]);
    setRecentDocumentIds((prev) => {
      const withoutCurrent = prev.filter((id) => id !== doc.id);
      return [doc.id, ...withoutCurrent].slice(0, 20);
    });
  };

  const onDownloadVersion = async (docId: number, versionId: number) => {
    setDownloadingId(versionId);
    try {
      const response = await getDocumentVersionDownloadUrl(docId, versionId);
      const url = response.status >= 200 && response.status < 300 ? extractDownloadUrl(response.data) : null;

      if (url) {
        const fileResponse = await fetch(url);
        if (!fileResponse.ok) {
          throw new Error("Не удалось скачать файл по ссылке");
        }
        const blob = await fileResponse.blob();
        const filenameFromHeader = extractFilenameFromDisposition(fileResponse.headers.get("content-disposition"));
        const version = documentVersions.find((item) => item.id === versionId);
        const filename = filenameFromHeader || version?.original_filename || "document-version";
        saveBlobFile(blob, filename);
        return;
      }

      const blobResponse = await downloadDocumentVersionFile(docId, versionId);
      if (blobResponse.status < 200 || blobResponse.status >= 300) {
        throw new Error(blobResponse.message || "Не удалось скачать версию");
      }
      const version = documentVersions.find((item) => item.id === versionId);
      const filename = blobResponse.filename || version?.original_filename || "document-version";
      saveBlobFile(blobResponse.data, filename);
    } catch (error: any) {
      showAlert(error?.message || "Не удалось скачать версию", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const onUploadNewVersion = async () => {
    if (!selectedDocument) {
      return;
    }

    if (!uploadVersionFile) {
      showAlert("Выберите файл для загрузки версии", "warning");
      return;
    }

    if (!validateFileForUpload(uploadVersionFile)) {
      return;
    }

    setUploading(true);
    setUploadVersionProgress(0);
    const response = await uploadDocumentVersion(
      selectedDocument.id,
      uploadVersionFile,
      {
        upload_comment: uploadVersionComment.trim() || undefined,
        bump_major: uploadVersionMajor,
      },
      {
        onProgress: (progress) => setUploadVersionProgress(progress),
      }
    );
    setUploading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Новая версия загружена", "success");
      setUploadVersionFile(null);
      setUploadVersionComment("");
      setUploadVersionMajor(false);
      setUploadVersionProgress(null);
      await fetchDocumentsByFolder(currentFolderId);
      await fetchDocumentVersions(selectedDocument.id);
      return;
    }
    setUploadVersionProgress(null);
    showAlert(response.message || "Не удалось загрузить новую версию", "error");
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
      type: editingDocumentData.type || undefined,
      description: editingDocumentData.description || undefined,
      status: editingDocumentData.status,
      curator_id: editingDocumentData.curator_id || undefined,
    });
    setDocumentActionLoading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Документ обновлен", "success");
      setIsEditingDocument(false);
      setSelectedDocument(response.data);
      void fetchProfilesByEids([response.data.author_id, response.data.curator_id]);
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }

    showAlert(response.message || "Не удалось обновить документ", "error");
  };

  const onArchiveDocument = async () => {
    if (!selectedDocument) {
      return;
    }

    const isConfirmed = window.confirm(
      `Архивировать документ "${selectedDocument.title}"?`
    );

    if (!isConfirmed) {
      return;
    }

    setDocumentActionLoading(true);
    const response = await archiveDocument(selectedDocument.id, {
      comment: "Переведен в архив",
    });
    setDocumentActionLoading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Документ архивирован", "success");
      setSelectedDocument(response.data);
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }

    showAlert(response.message || "Не удалось архивировать документ", "error");
  };

  const onRestoreDocument = async () => {
    if (!selectedDocument) {
      return;
    }

    setDocumentActionLoading(true);
    const response = await restoreDocument(selectedDocument.id);
    setDocumentActionLoading(false);

    if (response.status >= 200 && response.status < 300) {
      showAlert("Документ восстановлен", "success");
      setSelectedDocument(response.data);
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }

    showAlert(response.message || "Не удалось восстановить документ", "error");
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
      type: normalizeDocumentType(selectedDocument.type) || "REGULATION",
      description: selectedDocument.description || "",
      status: selectedDocument.status === "PUBLISHED" ? "ACTIVE" : selectedDocument.status,
      curator_id: selectedDocument.curator_id,
    });
    setIsEditingDocument(true);
  };

  if (loading) {
    return (
      <div className="animate-pulse rounded-3xl border border-purple-100 bg-linear-to-br from-white via-purple-50/50 to-blue-50/40 p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="h-10 w-64 rounded-xl bg-purple-100"></div>
          <div className="h-10 w-40 rounded-xl bg-purple-100"></div>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="h-24 rounded-2xl bg-white"></div>
          <div className="h-24 rounded-2xl bg-white"></div>
          <div className="h-24 rounded-2xl bg-white"></div>
          <div className="h-24 rounded-2xl bg-white"></div>
        </div>
        <div className="space-y-3">
          <div className="h-20 rounded-2xl bg-white"></div>
          <div className="h-20 rounded-2xl bg-white"></div>
          <div className="h-20 rounded-2xl bg-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-purple-100 bg-linear-to-br from-white via-purple-50/60 to-blue-50/40 shadow-sm">
        <div className="border-b border-purple-100/80 bg-white/70 p-6 backdrop-blur md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-1 text-xs font-medium text-purple-700">
                <Sparkles className="h-3.5 w-3.5" />
                Центр знаний компании
              </div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Управление документами</h2>
              <p className="mt-2 text-sm text-gray-600">Быстрый поиск, понятная структура папок и удобная работа с версиями.</p>
            </div>
            {canManageDocuments && (
              <button
                onClick={onUploadClick}
                disabled={uploading || folderActionLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {uploading ? "Загрузка..." : "Добавить документ"}
              </button>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {overviewStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
                  <div className="mb-2 inline-flex rounded-lg bg-purple-50 p-2 text-purple-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.hint}</p>
                </div>
              );
            })}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                      : "border-purple-100 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию, содержимому..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-purple-100 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
              />
            </label>
            <button
              type="button"
              onClick={() => setActiveFolderPicker("current")}
              className="rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-left transition hover:bg-purple-50"
            >
              <span className="block text-xs text-gray-500">Текущая папка</span>
              <span className="block max-w-64 truncate text-sm font-semibold text-gray-900">
                {getFolderDisplayName(currentFolderId, "Корень")}
              </span>
            </button>
            <label className="flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-sm text-gray-700 transition hover:bg-purple-50">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(event) => setShowArchived(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Показать архив
            </label>
            <select
              value={documentFilter}
              onChange={(event) => setDocumentFilter(event.target.value)}
              className="rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
            >
              <option value="all">Все типы</option>
              {types
                .filter((type) => type !== "all")
                .map((type) => (
                  <option key={type} value={type}>
                    {formatDocumentType(type)}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
              className={`rounded-xl border px-4 py-2.5 text-sm transition ${
                isAdvancedSearchOpen || searchStatus !== "all" || searchAuthorId || searchCuratorId || searchDateFrom || searchDateTo
                  ? "border-purple-600 bg-purple-50 text-purple-700"
                  : "border-purple-100 bg-white text-gray-700 hover:bg-purple-50"
              }`}
            >
              Параметры
            </button>
          </div>

          {isAdvancedSearchOpen && (
            <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-purple-100 bg-purple-50/50 p-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Статус</label>
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="all">Любой</option>
                  <option value="DRAFT">Черновик</option>
                  <option value="ACTIVE">Действующий</option>
                  <option value="ARCHIVED">Архивный</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Автор (EID)</label>
                <input
                  type="text"
                  value={searchAuthorId}
                  onChange={(e) => setSearchAuthorId(e.target.value)}
                  placeholder="Введите EID"
                  className="w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Куратор (EID)</label>
                <input
                  type="text"
                  value={searchCuratorId}
                  onChange={(e) => setSearchCuratorId(e.target.value)}
                  placeholder="Введите EID"
                  className="w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Период загрузки</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={searchDateFrom}
                    onChange={(e) => setSearchDateFrom(e.target.value)}
                    className="w-full rounded-lg border border-purple-100 bg-white px-2 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={searchDateTo}
                    onChange={(e) => setSearchDateTo(e.target.value)}
                    className="w-full rounded-lg border border-purple-100 bg-white px-2 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          {canManageDocuments && (
            <div className="mb-6 space-y-4 rounded-2xl border border-purple-100 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Работа с папками</h3>

              <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">Новая папка</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(event) => setNewFolderName(event.target.value)}
                    placeholder="Введите название папки"
                    className="w-full rounded-xl border border-purple-100 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Родитель</label>
                  <button
                    type="button"
                    onClick={() => setActiveFolderPicker("new-parent")}
                    className="w-full rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-left transition hover:bg-purple-50"
                  >
                    <span className="block text-xs text-gray-500">Родительская папка</span>
                    <span className="block truncate text-sm font-semibold text-gray-900">
                      {getFolderDisplayName(newFolderParentId, "Корень")}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onCreateFolder}
                  disabled={folderActionLoading}
                  className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-60"
                >
                  Создать папку
                </button>
              </div>

              <div className="grid grid-cols-1 items-end gap-3 border-t border-purple-100 pt-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Выберите папку</label>
                  <button
                    type="button"
                    onClick={() => setActiveFolderPicker("manage")}
                    className="w-full rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-left transition hover:bg-purple-50"
                  >
                    <span className="block text-xs text-gray-500">Папка для управления</span>
                    <span className="block truncate text-sm font-semibold text-gray-900">
                      {getFolderDisplayName(folderManagerId, "Не выбрано")}
                    </span>
                  </button>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">Новое название</label>
                  <input
                    type="text"
                    value={renameFolderName}
                    onChange={(event) => setRenameFolderName(event.target.value)}
                    placeholder="Введите новое название"
                    className="w-full rounded-xl border border-purple-100 px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={onRenameFolder}
                  disabled={folderActionLoading}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Переименовать
                </button>
                <button
                  onClick={onDeleteFolder}
                  disabled={folderActionLoading}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}

          <div className="mb-5 rounded-2xl border border-purple-100 bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void navigateToFolder(null)}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition ${
                  currentFolderId === null
                    ? "bg-purple-600 text-white"
                    : "border border-purple-100 bg-white text-gray-700 hover:bg-purple-50"
                }`}
              >
                <Home className="h-4 w-4" />
                Корень
              </button>
              {getFolderPath(currentFolderId).map((folder) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <button
                    onClick={() => void navigateToFolder(folder.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-purple-100 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-purple-50"
                    title={folder.path}
                  >
                    <Folder className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {isSearching && (
              <p className="px-1 text-sm font-medium text-purple-600 animate-pulse">Выполняется поиск документов...</p>
            )}
            {documentsLoading && !isSearching && (
              <p className="px-1 text-sm text-gray-500">Загружаем документы выбранной папки...</p>
            )}

            {!isSearching && childFolders.map((folder) => {
              const { docs, subs } = getFolderContents(folder.id);
              return (
                <button
                  key={`folder-${folder.id}`}
                  onClick={() => void onOpenFolder(folder.id)}
                  className="group w-full rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50/70 to-indigo-50/40 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="rounded-lg bg-white p-2 text-blue-700 shadow-sm">
                        <FolderOpen className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-gray-900">{folder.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          {docs > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                              <FileText className="h-3 w-3" />
                              {docs} {docs === 1 ? "документ" : "документов"}
                            </span>
                          )}
                          {subs > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                              <Folder className="h-3 w-3" />
                              {subs} {subs === 1 ? "папка" : "папок"}
                            </span>
                          )}
                          {docs === 0 && subs === 0 && <span className="italic text-gray-400">Папка пуста</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-blue-500 transition group-hover:translate-x-0.5" />
                  </div>
                </button>
              );
            })}

            {filteredDocuments.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className="group w-full rounded-2xl border border-purple-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-gray-900">{doc.title}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClasses[doc.status]}`}>
                        {statusLabels[doc.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {formatDocumentType(doc.type)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Folder className="h-4 w-4" />
                        {folders.find((item) => item.id === doc.folder_id)?.name || "Без папки"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-4 w-4" />
                        {formatDateTime(doc.created_at)}
                      </span>
                      <span>{getPersonDisplayName(doc.author_id)}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">v{doc.current_version}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-purple-500" />
                </div>
              </button>
            ))}

            {!filteredDocuments.length && !childFolders.length && (
              <div className="rounded-2xl border border-dashed border-purple-200 bg-white p-8 text-center">
                <p className="text-gray-600">В текущей папке пока нет ни документов, ни вложенных папок</p>
              </div>
            )}
          </div>
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
              onChange={onUploadFileChange}
              accept=".docx,.pdf,.xlsx,.jpg,.jpeg,.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {uploadFile && <p className="text-xs text-gray-500 mt-1">Выбрано: {uploadFile.name}</p>}
            {uploading && uploadProgress !== null && (
              <div className="mt-2">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-purple-600 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Загрузка: {uploadProgress}%</p>
              </div>
            )}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип документа *</label>
            <select
              value={uploadType}
              onChange={(event) => setUploadType(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" disabled>
                Выберите тип документа
              </option>
              {documentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
        setDocumentVersions([]);
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
                  <button
                    onClick={() => onOpenPreview(selectedDocument)}
                    className="flex-1 min-w-44 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs truncate flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Предпросмотр
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
                      {selectedDocument.status === "ARCHIVED" ? (
                        <button
                          onClick={onRestoreDocument}
                          disabled={documentActionLoading}
                          className="flex-1 min-w-32 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Восстановить
                        </button>
                      ) : (
                        <button
                          onClick={onArchiveDocument}
                          disabled={documentActionLoading}
                          className="flex-1 min-w-32 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Архивировать
                        </button>
                      )}
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
                      <h3 className="font-semibold text-gray-900 mb-2">Новая версия</h3>
                      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Файл версии</label>
                          <input
                            type="file"
                            onChange={onUploadVersionFileChange}
                            accept=".docx,.pdf,.xlsx,.jpg,.jpeg,.png"
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          {uploadVersionFile && (
                            <p className="text-xs text-gray-500 mt-1">Выбрано: {uploadVersionFile.name}</p>
                          )}
                          {uploading && uploadVersionProgress !== null && (
                            <div className="mt-2">
                              <div className="h-2 w-full rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-purple-600 transition-all"
                                  style={{ width: `${uploadVersionProgress}%` }}
                                ></div>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">Загрузка: {uploadVersionProgress}%</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Комментарий</label>
                          <input
                            type="text"
                            value={uploadVersionComment}
                            onChange={(event) => setUploadVersionComment(event.target.value)}
                            placeholder="Кратко опишите изменения"
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={uploadVersionMajor}
                            onChange={(event) => setUploadVersionMajor(event.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          Мажорное обновление (увеличить старшую версию)
                        </label>
                        <button
                          onClick={onUploadNewVersion}
                          disabled={uploading}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
                        >
                          <UploadCloud className="h-4 w-4" />
                          {uploading ? "Загрузка..." : "Загрузить новую версию"}
                        </button>
                      </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип документа *</label>
                  <select
                    value={editingDocumentData.type}
                    onChange={(e) =>
                      setEditingDocumentData({
                        ...editingDocumentData,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {documentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
                    <option value="ACTIVE">Действующий</option>
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

            <div className="pt-2 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">История версий</h3>
              {versionsLoading ? (
                <p className="text-sm text-gray-500">Загрузка истории...</p>
              ) : documentVersions.length ? (
                <div className="space-y-2">
                  {documentVersions.map((version) => {
                    const versionLabel = version.version_number || `${version.version_major}.${version.version_minor}`;
                    const isCurrent = version.is_current;
                    return (
                      <div
                        key={`version-${version.id}`}
                        className={`rounded-lg border p-3 ${isCurrent ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">Версия {versionLabel}</span>
                              {isCurrent && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                  Актуальная
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">
                              {getPersonDisplayName(version.uploaded_by)} · {formatDateTime(version.created_at)}
                            </p>
                            <p className="text-xs text-gray-500">{version.upload_comment || "Комментарий не указан"}</p>
                          </div>
                          <button
                            onClick={() => onDownloadVersion(selectedDocument.id, version.id)}
                            disabled={downloadingId === version.id}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {downloadingId === version.id ? "Готовим..." : "Скачать"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">История версий пока отсутствует.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <DocumentPreviewModal document={previewDocument} onClose={closePreview} />

      <AlertModal {...alertState} onClose={closeAlert} />
    </div>
  );
};

export default DocumentsModule;
