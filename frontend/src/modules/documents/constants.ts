import type { Document } from "../../api/documentsApi";

export const statusLabels: Record<Document["status"], string> = {
  DRAFT: "Черновик",
  ACTIVE: "Действующий",
  PUBLISHED: "Действующий",
  ARCHIVED: "Архивный",
};

export const statusBadgeClasses: Record<Document["status"], string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-green-100 text-green-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-red-100 text-red-700",
};

export const documentTypeOptions = [
  { value: "REGULATION", label: "Регламент" },
  { value: "ORDER", label: "Приказ" },
  { value: "INSTRUCTION", label: "Указание" },
  { value: "CB_LETTER", label: "Письмо ЦБ" },
  { value: "MANUAL", label: "Инструкция" },
] as const;

export type DocumentTypeValue = (typeof documentTypeOptions)[number]["value"];

export const documentTypeValues = new Set<string>(documentTypeOptions.map((o) => o.value));

export const documentTypeAliases: Record<string, DocumentTypeValue> = {
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

export const documentTypeLabels: Record<string, string> = {
  REGULATION: "Регламент",
  ORDER: "Приказ",
  INSTRUCTION: "Указание",
  CB_LETTER: "Письмо ЦБ",
  MANUAL: "Инструкция",
};

export const documentTypeColors: Record<
  string,
  { leftBorder: string; typeBadge: string }
> = {
  REGULATION: { leftBorder: "border-l-purple-400", typeBadge: "bg-purple-50 text-purple-700" },
  ORDER: { leftBorder: "border-l-blue-400", typeBadge: "bg-blue-50 text-blue-700" },
  INSTRUCTION: { leftBorder: "border-l-amber-400", typeBadge: "bg-amber-50 text-amber-700" },
  CB_LETTER: { leftBorder: "border-l-green-400", typeBadge: "bg-green-50 text-green-700" },
  MANUAL: { leftBorder: "border-l-cyan-400", typeBadge: "bg-cyan-50 text-cyan-700" },
};

export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

export const allowedExtensions = new Set(["docx", "pdf", "xlsx", "jpg", "jpeg", "png"]);

export const allowedMimeTypes = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
]);
