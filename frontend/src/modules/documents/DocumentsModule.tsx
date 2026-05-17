import {
  Archive,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Files,
  Folder,
  FolderOpen,
  Home,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  FolderTree as FolderTreeIcon,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AlertModal from "../../components/common/AlertModal";
import {
  archiveDocument,
  createFolder,
  deleteDocument,
  deleteFolder,
  downloadDocumentFile,
  downloadDocumentVersionFile,
  getDocumentDownloadUrl,
  getDocuments,
  getDocumentVersionDownloadUrl,
  getDocumentVersions,
  getFoldersTree,
  restoreDocument,
  searchDocuments,
  updateDocument,
  updateFolder,
  uploadDocument,
  uploadDocumentVersion,
  type Document,
  type DocumentVersion,
} from "../../api/documentsApi";
import { getProfileByEid } from "../../api/profileApi";
import { useAlert } from "../../hooks/useAlert";
import usePortalStore from "../../store/usePortalStore";
import {
  documentTypeOptions,
  statusBadgeClasses,
  statusLabels,
} from "./constants";
import {
  extractDownloadUrl,
  extractFilenameFromDisposition,
  flattenFolderTree,
  formatDateTime,
  getReadDocumentIds,
  normalizeDocumentType,
  pluralize,
  saveReadDocumentIds,
} from "./utils";
import type { BrowserFolder, EditingDocumentData } from "./types";
import DocumentDetailModal from "./components/DocumentDetailModal";
import DocumentPreviewModal from "./components/DocumentPreviewModal";
import FolderManager from "./components/FolderManager";
import FolderPickerModal from "./components/FolderPickerModal";
import UploadDocumentModal from "./components/UploadDocumentModal";

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

type ActiveTab = "all" | "mine" | "recent" | "archive";
type FolderPickerType = "current" | "new-parent" | "manage" | "upload";

const TAB_ITEMS: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "Все", icon: Files },
  { id: "mine", label: "Мои", icon: UserRound },
  { id: "recent", label: "Недавние", icon: Clock3 },
  { id: "archive", label: "Архив", icon: Archive },
];

const STAT_TONES = [
  "bg-wb-green-light text-wb-green",
  "bg-wb-pink-light text-wb-pink-dark",
  "bg-wb-pink-dark text-white",
  "bg-gray-900 text-white",
] as const;

const DocumentsModule = () => {
  const { currentUser, roles } = usePortalStore();
  const isAdmin = roles.includes("admin");
  const currentEid = String(currentUser?.eid ?? "");
  const { alertState, showAlert, closeAlert } = useAlert();
  const initialLoadRef = useRef(false);

  // --- Navigation & filters ---
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [documentFilter, setDocumentFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [searchStatus, setSearchStatus] = useState<Document["status"] | "all">("all");
  const [searchAuthorId, setSearchAuthorId] = useState("");
  const [searchCuratorId, setSearchCuratorId] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");

  // --- Data ---
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<BrowserFolder[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<Document[] | null>(null);
  const [recentDocumentIds, setRecentDocumentIds] = useState<number[]>([]);
  const [readDocumentIds, setReadDocumentIds] = useState<Set<number>>(getReadDocumentIds);

  // --- Loading states ---
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [documentActionLoading, setDocumentActionLoading] = useState(false);
  const [folderActionLoading, setFolderActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadVersionProgress, setUploadVersionProgress] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // --- Modals ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [activeFolderPicker, setActiveFolderPicker] = useState<FolderPickerType | null>(null);

  // --- Folder management ---
  const [folderManagerId, setFolderManagerId] = useState<number | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParentId, setNewFolderParentId] = useState<number | null>(null);
  const [uploadFolderId, setUploadFolderId] = useState<number | null>(null);

  // --- Derived ---
  const isAnyDocumentCurator = useMemo(
    () => documents.some((doc) => String(doc.curator_id ?? "") === currentEid),
    [currentEid, documents]
  );
  const canManageDocuments = isAdmin || isAnyDocumentCurator;
  const canManageSelectedDocument = useMemo(() => {
    if (!selectedDocument) return isAdmin;
    return isAdmin || String(selectedDocument.curator_id ?? "") === currentEid;
  }, [currentEid, isAdmin, selectedDocument]);

  const getFolderPath = useCallback(
    (folderId: number | null): BrowserFolder[] => {
      const path: BrowserFolder[] = [];
      let currentId = folderId;
      while (currentId !== null) {
        const folder = folders.find((f) => f.id === currentId);
        if (!folder) break;
        path.unshift(folder);
        currentId = folder.parent_id;
      }
      return path;
    },
    [folders]
  );

  const getFolderDisplayName = useCallback(
    (folderId: number | null, rootLabel: string) =>
      folderId === null ? rootLabel : (folders.find((f) => f.id === folderId)?.name ?? rootLabel),
    [folders]
  );

  const getPersonDisplayName = useCallback(
    (eid: string | null | undefined) => {
      if (!eid) return "-";
      return profilesMap[String(eid)] ?? String(eid);
    },
    [profilesMap]
  );

  const childFolders = useMemo(() => {
    if (searchResults !== null) return [];
    const query = searchQuery.trim().toLowerCase();
    const result = folders.filter((f) => f.parent_id === currentFolderId);
    return query ? result.filter((f) => f.name.toLowerCase().includes(query)) : result;
  }, [currentFolderId, folders, searchQuery, searchResults]);

  const filteredDocuments = useMemo(() => {
    let result = searchResults !== null ? searchResults : documents;

    if (activeTab === "mine") {
      result = result.filter(
        (doc) => String(doc.author_id) === currentEid || String(doc.curator_id ?? "") === currentEid
      );
    }

    if (activeTab === "recent") {
      result = result.filter((doc) => recentDocumentIds.includes(doc.id));
      result = [...result].sort((a, b) => recentDocumentIds.indexOf(a.id) - recentDocumentIds.indexOf(b.id));
    }

    if (activeTab === "archive") {
      result = result.filter((doc) => doc.status === "ARCHIVED");
    }

    if (searchResults === null) {
      result = result.filter((doc) => (doc.folder_id ?? null) === currentFolderId);
      if (!showArchived && activeTab !== "archive") {
        result = result.filter((doc) => doc.status !== "ARCHIVED");
      }
      if (documentFilter !== "all") {
        result = result.filter((doc) => normalizeDocumentType(doc.type) === documentFilter);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (doc) =>
            doc.title.toLowerCase().includes(q) ||
            doc.original_filename.toLowerCase().includes(q) ||
            (doc.description ?? "").toLowerCase().includes(q)
        );
      }
    }

    return result;
  }, [activeTab, currentEid, currentFolderId, documentFilter, documents, recentDocumentIds, searchQuery, searchResults, showArchived]);

  const getFolderContents = useCallback(
    (folderId: number) => ({
      docs: documents.filter((doc) => doc.folder_id === folderId).length,
      subs: folders.filter((f) => f.parent_id === folderId).length,
    }),
    [documents, folders]
  );

  const overviewStats = useMemo(() => {
    const docsInFolder = documents.filter((doc) => (doc.folder_id ?? null) === currentFolderId);
    const unreadCount = docsInFolder.filter((doc) => !readDocumentIds.has(doc.id)).length;
    return [
      { label: "Документов", value: docsInFolder.length, hint: "в текущей папке", icon: FileText },
      { label: "Подпапок", value: childFolders.length, hint: "на этом уровне", icon: FolderTreeIcon },
      { label: "Не прочитано", value: unreadCount, hint: "требуют внимания", icon: Eye },
      { label: "Недавние", value: recentDocumentIds.length, hint: "история просмотра", icon: Clock3 },
    ];
  }, [childFolders.length, currentFolderId, documents, readDocumentIds, recentDocumentIds.length]);

  // --- Data fetchers ---
  const fetchProfilesByEids = useCallback(
    async (eids: Array<string | null | undefined>) => {
      const missing = Array.from(
        new Set(eids.filter((e): e is string => Boolean(e)).map(String))
      ).filter((e) => !profilesMap[e]);

      if (!missing.length) return;

      const responses = await Promise.all(missing.map((eid) => getProfileByEid(eid)));
      const entries: Record<string, string> = {};
      responses.forEach((res, i) => {
        if (res.status >= 200 && res.status < 300 && res.data) {
          const eid = String(res.data.eid ?? missing[i]);
          if (eid) entries[eid] = res.data.full_name ?? eid;
        }
      });
      if (Object.keys(entries).length) setProfilesMap((prev) => ({ ...prev, ...entries }));
    },
    [profilesMap]
  );

  const fetchFolders = useCallback(async () => {
    const res = await getFoldersTree();
    if (res.status >= 200 && res.status < 300) {
      const flat = flattenFolderTree(res.data ?? []);
      setFolders(flat);
      const ids = new Set(flat.map((f) => f.id));
      setFolderManagerId((p) => (p !== null && !ids.has(p) ? null : p));
      setCurrentFolderId((p) => (p !== null && !ids.has(p) ? null : p));
      setNewFolderParentId((p) => (p !== null && !ids.has(p) ? null : p));
      setUploadFolderId((p) => (p !== null && !ids.has(p) ? null : p));
      return true;
    }
    showAlert(res.message ?? "Не удалось загрузить папки", "error");
    return false;
  }, [showAlert]);

  const fetchDocumentsByFolder = useCallback(
    async (folderId: number | null) => {
      if (!initialLoadRef.current) return;
      setDocumentsLoading(true);
      const res = await getDocuments({ folder_id: folderId, show_archived: showArchived, page: 1, size: 100 });
      setDocumentsLoading(false);
      if (res.status >= 200 && res.status < 300) {
        const docs = res.data ?? [];
        setDocuments(docs);
        void fetchProfilesByEids(docs.flatMap((d) => [d.author_id, d.curator_id]));
        return;
      }
      setDocuments([]);
      showAlert(res.message ?? "Не удалось загрузить документы", "error");
    },
    [fetchProfilesByEids, showAlert, showArchived]
  );

  const fetchDocumentVersions = useCallback(
    async (docId: number) => {
      setVersionsLoading(true);
      const res = await getDocumentVersions(docId);
      setVersionsLoading(false);
      if (res.status >= 200 && res.status < 300) {
        const sorted = [...(res.data ?? [])].sort((a, b) => b.id - a.id);
        setDocumentVersions(sorted);
        void fetchProfilesByEids(sorted.map((v) => v.uploaded_by));
        return;
      }
      setDocumentVersions([]);
      showAlert(res.message ?? "Не удалось загрузить версии", "error");
    },
    [fetchProfilesByEids, showAlert]
  );

  // --- Init ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchFolders();
      initialLoadRef.current = true;
      await fetchDocumentsByFolder(null);
      setLoading(false);
    };
    void init();
  }, [fetchDocumentsByFolder, fetchFolders]);

  useEffect(() => {
    if (!initialLoadRef.current) return;
    void fetchDocumentsByFolder(currentFolderId);
  }, [currentFolderId, fetchDocumentsByFolder, showArchived]);

  // --- Search ---
  const executeSearch = useCallback(async () => {
    const hasFilters =
      searchQuery.trim() ||
      documentFilter !== "all" ||
      searchStatus !== "all" ||
      searchAuthorId.trim() ||
      searchCuratorId.trim() ||
      searchDateFrom ||
      searchDateTo ||
      activeTab === "archive";

    if (!hasFilters) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    const res = await searchDocuments({
      q: searchQuery.trim() || null,
      doc_type: documentFilter !== "all" ? documentFilter : null,
      status: activeTab === "archive" ? "ARCHIVED" : searchStatus !== "all" ? searchStatus : null,
      author_id: searchAuthorId.trim() || null,
      curator_id: searchCuratorId.trim() || null,
      date_from: searchDateFrom || null,
      date_to: searchDateTo || null,
      show_archived: showArchived || activeTab === "archive",
      size: 100,
    });
    setIsSearching(false);

    if (res.status >= 200 && res.status < 300) {
      const results = res.data ?? [];
      setSearchResults(results);
      void fetchProfilesByEids(results.flatMap((d) => [d.author_id, d.curator_id]));
    } else {
      showAlert(res.message ?? "Ошибка при поиске", "error");
    }
  }, [searchQuery, documentFilter, searchStatus, searchAuthorId, searchCuratorId, searchDateFrom, searchDateTo, showArchived, activeTab, fetchProfilesByEids, showAlert]);

  useEffect(() => {
    const timer = setTimeout(() => void executeSearch(), 400);
    return () => clearTimeout(timer);
  }, [executeSearch]);

  // --- Folder picker ---
  const folderPickerConfig = useMemo(() => {
    if (!activeFolderPicker) return null;
    const configs: Record<FolderPickerType, { title: string; rootLabel: string; initialValue: number | null }> = {
      current: { title: "Выбор текущей папки", rootLabel: "Корень", initialValue: currentFolderId },
      "new-parent": { title: "Родительская папка", rootLabel: "Корень", initialValue: newFolderParentId },
      manage: { title: "Папка для управления", rootLabel: "Не выбрано", initialValue: folderManagerId },
      upload: { title: "Папка для документа", rootLabel: "Без папки", initialValue: uploadFolderId },
    };
    return configs[activeFolderPicker];
  }, [activeFolderPicker, currentFolderId, folderManagerId, newFolderParentId, uploadFolderId]);

  const onFolderPickerConfirm = async (value: number | null) => {
    const type = activeFolderPicker;
    setActiveFolderPicker(null);
    if (type === "current") {
      setCurrentFolderId(value);
      await fetchDocumentsByFolder(value);
    } else if (type === "new-parent") {
      setNewFolderParentId(value);
    } else if (type === "manage") {
      setFolderManagerId(value);
      setRenameFolderName(folders.find((f) => f.id === value)?.name ?? "");
    } else {
      setUploadFolderId(value);
    }
  };

  // --- Document actions ---
  const onSelectDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setDocumentVersions([]);
    void fetchDocumentVersions(doc.id);
    void fetchProfilesByEids([doc.author_id, doc.curator_id]);
    setRecentDocumentIds((prev) => [doc.id, ...prev.filter((id) => id !== doc.id)].slice(0, 20));
  };

  const onDownloadDocument = async (docId: number) => {
    setDownloadingId(docId);
    try {
      const res = await getDocumentDownloadUrl(docId);
      const url = res.status >= 200 && res.status < 300 ? extractDownloadUrl(res.data) : null;
      if (url) {
        const fileRes = await fetch(url);
        if (!fileRes.ok) throw new Error("Не удалось скачать файл");
        const blob = await fileRes.blob();
        const filename = extractFilenameFromDisposition(fileRes.headers.get("content-disposition"))
          ?? selectedDocument?.original_filename ?? "document";
        saveBlobFile(blob, filename);
        return;
      }
      const blobRes = await downloadDocumentFile(docId);
      if (blobRes.status < 200 || blobRes.status >= 300) throw new Error(blobRes.message ?? "Не удалось скачать");
      saveBlobFile(blobRes.data, blobRes.filename ?? selectedDocument?.original_filename ?? "document");
    } catch (e: any) {
      showAlert(e?.message ?? "Не удалось скачать документ", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const onDownloadVersion = async (docId: number, versionId: number) => {
    setDownloadingId(versionId);
    try {
      const res = await getDocumentVersionDownloadUrl(docId, versionId);
      const url = res.status >= 200 && res.status < 300 ? extractDownloadUrl(res.data) : null;
      if (url) {
        const fileRes = await fetch(url);
        if (!fileRes.ok) throw new Error("Не удалось скачать версию");
        const blob = await fileRes.blob();
        const version = documentVersions.find((v) => v.id === versionId);
        const filename = extractFilenameFromDisposition(fileRes.headers.get("content-disposition"))
          ?? version?.original_filename ?? "document-version";
        saveBlobFile(blob, filename);
        return;
      }
      const blobRes = await downloadDocumentVersionFile(docId, versionId);
      if (blobRes.status < 200 || blobRes.status >= 300) throw new Error(blobRes.message ?? "Не удалось скачать версию");
      const version = documentVersions.find((v) => v.id === versionId);
      saveBlobFile(blobRes.data, blobRes.filename ?? version?.original_filename ?? "document-version");
    } catch (e: any) {
      showAlert(e?.message ?? "Не удалось скачать версию", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const onMarkAsRead = () => {
    if (!selectedDocument) return;
    const next = new Set(readDocumentIds);
    next.add(selectedDocument.id);
    setReadDocumentIds(next);
    saveReadDocumentIds(next);
    showAlert("Документ отмечен как прочитанный", "success");
  };

  const onSaveEdit = async (data: EditingDocumentData): Promise<boolean> => {
    if (!selectedDocument) return false;
    setDocumentActionLoading(true);
    const res = await updateDocument(selectedDocument.id, {
      title: data.title || undefined,
      type: data.type || undefined,
      description: data.description || undefined,
      status: data.status,
      curator_id: data.curator_id || undefined,
    });
    setDocumentActionLoading(false);
    if (res.status >= 200 && res.status < 300) {
      showAlert("Документ обновлён", "success");
      setSelectedDocument(res.data);
      void fetchProfilesByEids([res.data.author_id, res.data.curator_id]);
      await fetchDocumentsByFolder(currentFolderId);
      return true;
    }
    showAlert(res.message ?? "Не удалось обновить документ", "error");
    return false;
  };

  const onArchiveDocument = async () => {
    if (!selectedDocument) return;
    if (!window.confirm(`Архивировать документ "${selectedDocument.title}"?`)) return;
    setDocumentActionLoading(true);
    const res = await archiveDocument(selectedDocument.id, { comment: "Переведён в архив" });
    setDocumentActionLoading(false);
    if (res.status >= 200 && res.status < 300) {
      showAlert("Документ архивирован", "success");
      setSelectedDocument(res.data);
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }
    showAlert(res.message ?? "Не удалось архивировать документ", "error");
  };

  const onRestoreDocument = async () => {
    if (!selectedDocument) return;
    setDocumentActionLoading(true);
    const res = await restoreDocument(selectedDocument.id);
    setDocumentActionLoading(false);
    if (res.status >= 200 && res.status < 300) {
      showAlert("Документ восстановлен", "success");
      setSelectedDocument(res.data);
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }
    showAlert(res.message ?? "Не удалось восстановить документ", "error");
  };

  const onDeleteDocument = async () => {
    if (!selectedDocument) return;
    if (!window.confirm(`Удалить "${selectedDocument.title}"? Это действие необратимо.`)) return;
    setDocumentActionLoading(true);
    const res = await deleteDocument(selectedDocument.id);
    setDocumentActionLoading(false);
    if (res.status >= 200 && res.status < 300) {
      showAlert("Документ удалён", "success");
      setSelectedDocument(null);
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }
    showAlert(res.message ?? "Не удалось удалить документ", "error");
  };

  const onUploadNewVersion = async (file: File, comment: string, major: boolean): Promise<boolean> => {
    if (!selectedDocument) return false;
    setUploading(true);
    setUploadVersionProgress(0);
    const res = await uploadDocumentVersion(
      selectedDocument.id,
      file,
      { upload_comment: comment || undefined, bump_major: major },
      { onProgress: (p) => setUploadVersionProgress(p) }
    );
    setUploading(false);
    setUploadVersionProgress(null);
    if (res.status >= 200 && res.status < 300) {
      showAlert("Новая версия загружена", "success");
      await fetchDocumentsByFolder(currentFolderId);
      await fetchDocumentVersions(selectedDocument.id);
      return true;
    }
    showAlert(res.message ?? "Не удалось загрузить версию", "error");
    return false;
  };

  // --- Folder actions ---
  const onCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) { showAlert("Введите название папки", "warning"); return; }
    setFolderActionLoading(true);
    const res = await createFolder({ name, parent_id: newFolderParentId });
    setFolderActionLoading(false);
    if (res.status >= 200 && res.status < 300) {
      showAlert("Папка создана", "success");
      setNewFolderName("");
      await fetchFolders();
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }
    showAlert(res.message ?? "Не удалось создать папку", "error");
  };

  const onRenameFolder = async () => {
    if (folderManagerId === null) { showAlert("Выберите папку", "warning"); return; }
    const name = renameFolderName.trim();
    if (!name) { showAlert("Введите новое название", "warning"); return; }
    setFolderActionLoading(true);
    const res = await updateFolder(folderManagerId, { name });
    setFolderActionLoading(false);
    if (res.status >= 200 && res.status < 300) {
      showAlert("Папка переименована", "success");
      await fetchFolders();
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }
    showAlert(res.message ?? "Не удалось переименовать папку", "error");
  };

  const onDeleteFolder = async () => {
    if (folderManagerId === null) { showAlert("Выберите папку", "warning"); return; }
    const folder = folders.find((f) => f.id === folderManagerId);
    if (!window.confirm(`Удалить папку "${folder?.name ?? "Без названия"}"? Это действие необратимо.`)) return;
    setFolderActionLoading(true);
    const res = await deleteFolder(folderManagerId);
    setFolderActionLoading(false);
    if (res.status >= 200 && res.status < 300) {
      showAlert("Папка удалена", "success");
      setFolderManagerId(null);
      setRenameFolderName("");
      await fetchFolders();
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }
    showAlert(res.message ?? "Не удалось удалить папку", "error");
  };

  const onUploadSubmit = async (params: {
    file: File;
    title: string;
    description: string;
    type: string;
    folderId: number | null;
  }) => {
    setUploading(true);
    setUploadProgress(0);
    const res = await uploadDocument(
      params.file,
      {
        title: params.title.trim() || params.file.name,
        type: params.type,
        description: params.description.trim() || undefined,
        folder_id: params.folderId,
      },
      { onProgress: (p) => setUploadProgress(p) }
    );
    setUploading(false);
    setUploadProgress(null);
    if (res.status >= 200 && res.status < 300) {
      showAlert("Документ успешно загружен", "success");
      setIsUploadModalOpen(false);
      await fetchDocumentsByFolder(currentFolderId);
      return;
    }
    showAlert(res.message ?? "Не удалось загрузить документ", "error");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="animate-pulse space-y-5">
        <div className="rounded-[28px] bg-wb-green p-8 sm:p-10">
          <div className="mb-4 h-8 w-48 rounded-full bg-white/20" />
          <div className="mb-3 h-12 w-96 max-w-full rounded-2xl bg-white/20" />
          <div className="h-5 w-72 max-w-full rounded-xl bg-white/20" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-[28px] bg-white" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-[28px] bg-white" />
          ))}
        </div>
      </div>
    );
  }

  const hasActiveSearchFilters =
    searchStatus !== "all" || searchAuthorId || searchCuratorId || searchDateFrom || searchDateTo;

  const folderPath = getFolderPath(currentFolderId);

  return (
    <div className="space-y-5">

      {/* ── Hero header ── */}
      <header className="rounded-[28px] bg-wb-green px-7 pt-8 pb-10 sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-extrabold tracking-wide text-wb-pink-dark">
              <Sparkles className="h-3.5 w-3.5" />
              Центр знаний компании
            </span>
            <h1 className="mt-4 text-[32px] font-black leading-tight tracking-tight text-white sm:text-[42px]">
              Управление документами
            </h1>
            <p className="mt-2 text-base font-medium leading-snug text-white/80">
              Быстрый поиск, структура папок и удобная работа с версиями.
            </p>
          </div>
          {canManageDocuments && (
            <button
              type="button"
              onClick={() => {
                setUploadFolderId(currentFolderId);
                setIsUploadModalOpen(true);
              }}
              disabled={uploading || folderActionLoading}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gray-900 px-5 py-3.5 text-[15px] font-bold whitespace-nowrap text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              <Plus className="h-4 w-4" />
              {uploading ? "Загрузка..." : "Добавить документ"}
            </button>
          )}
        </div>
      </header>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((item, i) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-[28px] bg-white p-6">
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${STAT_TONES[i]}`}>
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="text-[38px] font-black leading-none tracking-tight text-gray-900">{item.value}</div>
              <div className="mt-2 text-[15px] font-extrabold text-gray-800">{item.label}</div>
              <div className="mt-0.5 text-[12.5px] font-semibold text-gray-400">{item.hint}</div>
            </article>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-2.5">
        {TAB_ITEMS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{ paddingLeft: 18, paddingRight: 18 }}
              className={`inline-flex items-center gap-2 rounded-full py-3 text-[14.5px] font-bold transition hover:-translate-y-px ${
                isActive ? "bg-gray-900 text-white" : "bg-white text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Search card ── */}
      <div className="rounded-[28px] bg-white p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search input */}
          <div className="relative min-w-[220px] flex-1 basis-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, файлу, описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-wb-pink-light py-3.5 pl-12 pr-4 text-[14.5px] font-semibold text-gray-800 outline-none placeholder:font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-wb-green transition"
            />
          </div>

          {/* Folder picker */}
          <button
            type="button"
            onClick={() => setActiveFolderPicker("current")}
            className="min-w-[130px] cursor-pointer rounded-full bg-wb-pink-light px-4 py-2 text-left transition hover:opacity-80"
          >
            <div className="text-[11px] font-semibold leading-tight text-gray-500">Папка</div>
            <div className="max-w-32 truncate text-sm font-extrabold leading-tight text-gray-900">
              {getFolderDisplayName(currentFolderId, "Корень")}
            </div>
          </button>

          {/* Type select */}
          <div className="relative">
            <select
              value={documentFilter}
              onChange={(e) => setDocumentFilter(e.target.value)}
              className="appearance-none cursor-pointer rounded-full bg-wb-pink-light py-3 text-[14.5px] font-bold text-gray-800 outline-none focus:ring-2 focus:ring-inset focus:ring-wb-green transition"
              style={{ paddingLeft: 18, paddingRight: 38 }}
            >
              <option value="all">Все типы</option>
              {documentTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wb-green" />
          </div>

          {/* Archive checkbox */}
          <label
            className={`inline-flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-3 text-[14.5px] font-bold ring-1 ring-inset transition ${
              showArchived
                ? "bg-wb-green-light text-wb-green ring-wb-green"
                : "bg-white text-gray-800 ring-gray-200 hover:ring-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-md transition ${
                showArchived ? "bg-wb-green text-white" : "bg-white ring-1 ring-inset ring-gray-300"
              }`}
              aria-hidden="true"
            >
              {showArchived && (
                <svg viewBox="0 0 16 16" width="11" height="11">
                  <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span>Архив</span>
          </label>

          {/* Filters button */}
          <button
            type="button"
            onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
            style={{ paddingLeft: 18, paddingRight: 18 }}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full py-3 text-[14.5px] font-bold transition ${
              isAdvancedSearchOpen || hasActiveSearchFilters
                ? "bg-wb-pink-dark text-white"
                : "bg-white text-gray-800 ring-1 ring-inset ring-gray-200 hover:ring-gray-300"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Фильтры{hasActiveSearchFilters ? " •" : ""}</span>
          </button>
        </div>

        {/* Advanced filters */}
        {isAdvancedSearchOpen && (
          <div className="mt-4 border-t-2 border-dashed border-gray-100 pt-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">Статус</label>
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value as typeof searchStatus)}
                  className="w-full rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-wb-green transition"
                >
                  <option value="all">Любой</option>
                  <option value="DRAFT">Черновик</option>
                  <option value="ACTIVE">Действующий</option>
                  <option value="ARCHIVED">Архивный</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">Автор (EID)</label>
                <input
                  type="text"
                  value={searchAuthorId}
                  onChange={(e) => setSearchAuthorId(e.target.value)}
                  placeholder="EID"
                  className="w-full rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 placeholder:font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-wb-green transition"
                />
              </div>
              <div>
                <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">Куратор (EID)</label>
                <input
                  type="text"
                  value={searchCuratorId}
                  onChange={(e) => setSearchCuratorId(e.target.value)}
                  placeholder="EID"
                  className="w-full rounded-[14px] bg-white px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 placeholder:font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-wb-green transition"
                />
              </div>
              <div>
                <label className="mb-2 block text-[12.5px] font-bold tracking-wide text-gray-500">Период загрузки</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={searchDateFrom}
                    onChange={(e) => setSearchDateFrom(e.target.value)}
                    className="w-full rounded-[14px] bg-white px-3 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-wb-green transition"
                  />
                  <span className="font-extrabold text-gray-400">—</span>
                  <input
                    type="date"
                    value={searchDateTo}
                    onChange={(e) => setSearchDateTo(e.target.value)}
                    className="w-full rounded-[14px] bg-white px-3 py-3 text-[14.5px] font-semibold text-gray-800 outline-none ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-wb-green transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Folder manager ── */}
      {canManageDocuments && (
        <FolderManager
          folders={folders}
          folderManagerId={folderManagerId}
          renameFolderName={renameFolderName}
          newFolderName={newFolderName}
          newFolderParentId={newFolderParentId}
          folderActionLoading={folderActionLoading}
          getFolderDisplayName={getFolderDisplayName}
          onNewFolderNameChange={setNewFolderName}
          onNewFolderParentPickerOpen={() => setActiveFolderPicker("new-parent")}
          onCreateFolder={onCreateFolder}
          onFolderManagerPickerOpen={() => setActiveFolderPicker("manage")}
          onRenameFolderNameChange={setRenameFolderName}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
        />
      )}

      {/* ── Breadcrumbs ── */}
      <div className="rounded-[28px] bg-white px-4 py-3.5">
        <nav className="flex flex-wrap items-center gap-1.5" aria-label="Хлебные крошки">
          <button
            type="button"
            onClick={() => setCurrentFolderId(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            <Home className="h-3.5 w-3.5" />
            Корень
          </button>
          {folderPath.map((folder, i) => (
            <div key={folder.id} className="flex items-center gap-1.5">
              <span className="font-extrabold text-gray-400">/</span>
              <button
                type="button"
                onClick={() => setCurrentFolderId(folder.id)}
                title={folder.path}
                className={`rounded-full px-3.5 py-2 text-sm font-bold transition ${
                  i === folderPath.length - 1
                    ? "bg-wb-pink-light text-wb-green"
                    : "bg-transparent text-gray-700 hover:bg-wb-pink-light hover:text-wb-green"
                }`}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </nav>
      </div>

      {/* ── Status bar ── */}
      {(isSearching || documentsLoading) && (
        <p className={`px-1 text-sm ${isSearching ? "animate-pulse font-bold text-wb-green" : "text-gray-400"}`}>
          {isSearching ? "Поиск документов..." : "Загрузка..."}
        </p>
      )}

      {/* ── Content: folders + documents ── */}
      <div className="flex flex-col gap-3">
        {!isSearching && childFolders.map((folder) => {
          const { docs, subs } = getFolderContents(folder.id);
          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => setCurrentFolderId(folder.id)}
              className="group flex w-full items-center gap-4 rounded-[28px] bg-white p-5 text-left transition hover:-translate-y-px sm:p-6"
            >
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-wb-pink-light text-wb-pink-dark">
                <FolderOpen className="h-[22px] w-[22px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[17px] font-extrabold text-gray-900">{folder.name}</div>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {docs > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-wb-green-light px-2.5 py-1 text-[12.5px] font-bold text-wb-green">
                      <FileText className="h-3 w-3" />
                      {docs} {pluralize(docs, "документ", "документа", "документов")}
                    </span>
                  )}
                  {subs > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-wb-pink-light px-2.5 py-1 text-[12.5px] font-bold text-wb-pink-dark">
                      <Folder className="h-3 w-3" />
                      {subs} {pluralize(subs, "папка", "папки", "папок")}
                    </span>
                  )}
                  {docs === 0 && subs === 0 && (
                    <span className="text-[12.5px] italic text-gray-400">Папка пуста</span>
                  )}
                </div>
              </div>
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-wb-pink-light text-wb-green transition group-hover:bg-wb-pink-dark group-hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          );
        })}

        {filteredDocuments.map((doc) => {
          const isUnread = !readDocumentIds.has(doc.id);
          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelectDocument(doc)}
              className="group flex w-full items-start gap-4 rounded-[28px] bg-white p-5 text-left transition hover:-translate-y-px sm:p-6"
            >
              <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl ${isUnread ? "bg-wb-pink-light text-wb-pink-dark" : "bg-wb-green-light text-wb-green"}`}>
                <FileText className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  {isUnread && (
                    <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-wb-pink" title="Не прочитан" />
                  )}
                  <h3 className="truncate text-[17px] font-extrabold text-gray-900">{doc.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses[doc.status]}`}>
                    {statusLabels[doc.status]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500">
                  <span className="inline-flex items-center rounded-full bg-wb-pink-light px-2.5 py-1 text-[12px] font-bold text-gray-700">
                    {doc.type}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Folder className="h-3 w-3" />
                    {folders.find((f) => f.id === doc.folder_id)?.name ?? "Без папки"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" />
                    {formatDateTime(doc.created_at)}
                  </span>
                  <span>{getPersonDisplayName(doc.author_id)}</span>
                  <span className="rounded-full bg-wb-green-light px-2 py-0.5 text-[12px] font-bold text-wb-green">
                    v{doc.current_version}
                  </span>
                </div>
              </div>
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-wb-pink-light text-wb-green transition group-hover:bg-wb-pink-dark group-hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          );
        })}

        {!filteredDocuments.length && !childFolders.length && !isSearching && !documentsLoading && (
          <div className="rounded-[28px] border-2 border-dashed border-wb-pink-light bg-white p-10 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-wb-pink-light text-wb-pink-dark">
              <FileText className="h-7 w-7" />
            </div>
            <p className="text-[15px] font-extrabold text-gray-800">Документов и папок не найдено</p>
            <p className="mt-1 text-[12.5px] font-semibold text-gray-400">
              {searchQuery ? "Попробуйте другой запрос" : "В этой папке пока ничего нет"}
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        uploading={uploading}
        uploadProgress={uploadProgress}
        uploadFolderId={uploadFolderId}
        getFolderDisplayName={getFolderDisplayName}
        onClose={() => setIsUploadModalOpen(false)}
        onFolderPickerOpen={() => setActiveFolderPicker("upload")}
        onSubmit={onUploadSubmit}
        onValidationError={(msg) => showAlert(msg, "warning")}
      />

      <DocumentDetailModal
        key={selectedDocument?.id ?? "no-document"}
        document={selectedDocument}
        versions={documentVersions}
        versionsLoading={versionsLoading}
        downloadingId={downloadingId}
        documentActionLoading={documentActionLoading}
        uploading={uploading}
        uploadVersionProgress={uploadVersionProgress}
        canManage={canManageSelectedDocument}
        readDocumentIds={readDocumentIds}
        folders={folders}
        getPersonDisplayName={getPersonDisplayName}
        onClose={() => setSelectedDocument(null)}
        onDownload={onDownloadDocument}
        onPreview={(doc) => setPreviewDocument(doc)}
        onMarkAsRead={onMarkAsRead}
        onArchive={onArchiveDocument}
        onRestore={onRestoreDocument}
        onDelete={onDeleteDocument}
        onDownloadVersion={onDownloadVersion}
        onSaveEdit={onSaveEdit}
        onUploadNewVersion={onUploadNewVersion}
      />

      {folderPickerConfig && (
        <FolderPickerModal
          isOpen={activeFolderPicker !== null}
          title={folderPickerConfig.title}
          folders={folders}
          initialValue={folderPickerConfig.initialValue}
          rootLabel={folderPickerConfig.rootLabel}
          onClose={() => setActiveFolderPicker(null)}
          onConfirm={(value) => void onFolderPickerConfirm(value)}
        />
      )}

      <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />

      <AlertModal {...alertState} onClose={closeAlert} />
    </div>
  );
};

export default DocumentsModule;
