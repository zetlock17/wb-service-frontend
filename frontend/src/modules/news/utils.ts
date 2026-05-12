import type { NewsStatus } from "../../api/newsApi";
import type { OrgUnitHierarchy } from "../../api/orgStructureApi";
import type { AckOrgUnit } from "./types";

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'только что';
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const getStatusLabel = (
  status?: NewsStatus
): { label: string; className: string } => {
  switch (status) {
    case 'DRAFT':
      return { label: 'Черновик', className: 'bg-gray-100 text-gray-600' };
    case 'PUBLISHED':
      return { label: 'Опубликовано', className: 'bg-green-100 text-green-700' };
    case 'ARCHIVED':
      return { label: 'Архив', className: 'bg-yellow-100 text-yellow-700' };
    case 'SCHEDULED':
      return { label: 'По расписанию', className: 'bg-blue-100 text-blue-700' };
    default:
      return { label: 'Новость', className: 'bg-gray-100 text-gray-600' };
  }
};

export const flattenOrgUnits = (
  nodes: OrgUnitHierarchy[],
  level = 0
): AckOrgUnit[] =>
  nodes.flatMap((node) => [
    { id: node.id, name: node.name, level },
    ...flattenOrgUnits(node.children || [], level + 1),
  ]);

export const toApiDateTime = (value: string): string | null =>
  value ? new Date(value).toISOString().replace(/\.\d{3}Z$/, '') : null;
