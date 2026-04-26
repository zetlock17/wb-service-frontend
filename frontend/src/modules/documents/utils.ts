import type { FolderTree } from "../../api/documentsApi";
import {
  allowedExtensions,
  allowedMimeTypes,
  documentTypeAliases,
  documentTypeLabels,
  documentTypeValues,
  MAX_UPLOAD_SIZE,
  type DocumentTypeValue,
} from "./constants";
import type { BrowserFolder } from "./types";

export const extractDownloadUrl = (value: unknown): string | null => {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  for (const key of ["url", "download_url", "downloadUrl", "link", "signed_url"]) {
    const candidate = data[key];
    if (typeof candidate === "string" && candidate) return candidate;
  }
  return null;
};

export const formatDate = (value: string | null): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ru-RU");
};

export const formatDateTime = (value: string | null): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const normalizeDocumentType = (value: string | null | undefined): DocumentTypeValue | null => {
  if (!value) return null;
  if (documentTypeValues.has(value)) return value as DocumentTypeValue;
  const normalized = value.trim().toLowerCase();
  return documentTypeAliases[normalized] || null;
};

export const formatDocumentType = (value: string): string => {
  const normalizedValue = normalizeDocumentType(value);
  if (normalizedValue) return documentTypeLabels[normalizedValue];
  const normalized = value.trim().toLowerCase();
  return documentTypeLabels[normalized] || value;
};

export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return parts.pop()?.toLowerCase() || "";
};

export const isAllowedFile = (file: File): boolean => {
  if (file.size > MAX_UPLOAD_SIZE) return false;
  const extension = getFileExtension(file.name);
  if (extension && allowedExtensions.has(extension)) return true;
  if (file.type && allowedMimeTypes.has(file.type)) return true;
  return false;
};

export const saveBlobFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const extractFilenameFromDisposition = (contentDisposition: string | null): string | null => {
  if (!contentDisposition) return null;
  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);
  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) return asciiMatch[1];
  return null;
};

export const flattenFolderTree = (nodes: FolderTree[], parentId: number | null = null): BrowserFolder[] => {
  const result: BrowserFolder[] = [];
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name, path: node.path, parent_id: parentId });
    if (node.children.length) result.push(...flattenFolderTree(node.children, node.id));
  }
  return result;
};

export const getReadDocumentIds = (): Set<number> => {
  try {
    const saved = localStorage.getItem("readDocuments");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
};

export const saveReadDocumentIds = (ids: Set<number>) => {
  localStorage.setItem("readDocuments", JSON.stringify(Array.from(ids)));
};

export const pluralize = (count: number, one: string, few: string, many: string): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
};
