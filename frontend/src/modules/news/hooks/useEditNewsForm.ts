import { useState } from "react";
import {
  getCategories,
  updateNews,
  type Category,
  type NewsDetail,
  type NewsStatus,
  type NewsUpdate,
} from "../../../api/newsApi";
import {
  getOrgHierarchy,
  searchSuggestHierarchy,
  type ProfileSuggestion,
} from "../../../api/orgStructureApi";
import { flattenOrgUnits } from "../utils";
import type { AckEmployee, AckOrgUnit, AckTargetMode } from "../types";

type AlertFn = (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;

export interface EditFormData {
  title: string;
  short_description: string;
  content: string;
  category_ids: number[];
  is_pinned: boolean;
  mandatory_ack: boolean;
  comments_enabled: boolean;
  status: NewsStatus;
  tag_names: string;
  scheduled_publish_at_local: string;
  expires_at_local: string;
  file_ids: number[];
  ack_target_all: boolean;
}

const STATUSES_EDIT: NewsStatus[] = ['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'];

export { STATUSES_EDIT };

interface UseEditNewsFormParams {
  isNewsEditor: boolean;
  showAlert: AlertFn;
  onSaved: () => void;
}

export const useEditNewsForm = ({ isNewsEditor, showAlert, onSaved }: UseEditNewsFormParams) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategories, setEditCategories] = useState<Category[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const [editData, setEditData] = useState<EditFormData>({
    title: '',
    short_description: '',
    content: '',
    category_ids: [],
    is_pinned: false,
    mandatory_ack: false,
    comments_enabled: true,
    status: 'PUBLISHED',
    tag_names: '',
    scheduled_publish_at_local: '',
    expires_at_local: '',
    file_ids: [],
    ack_target_all: true,
  });

  const [editAckSelectedEmployees, setEditAckSelectedEmployees] = useState<AckEmployee[]>([]);
  const [editAckTargetMode, setEditAckTargetMode] = useState<AckTargetMode>('employees');
  const [editAckOrgUnitOptions, setEditAckOrgUnitOptions] = useState<AckOrgUnit[]>([]);
  const [editAckSelectedOrgUnits, setEditAckSelectedOrgUnits] = useState<AckOrgUnit[]>([]);
  const [editAckOrgUnitToAdd, setEditAckOrgUnitToAdd] = useState<string>('');
  const [loadingEditAckOrgUnits, setLoadingEditAckOrgUnits] = useState(false);
  const [editAckSearchQuery, setEditAckSearchQuery] = useState('');
  const [editAckSearchResults, setEditAckSearchResults] = useState<ProfileSuggestion[]>([]);
  const [editAckSearchLoading, setEditAckSearchLoading] = useState(false);

  const loadOrgUnitsForEditAck = async () => {
    if (editAckOrgUnitOptions.length > 0 || loadingEditAckOrgUnits) return;
    setLoadingEditAckOrgUnits(true);
    try {
      const response = await getOrgHierarchy();
      if (response.status === 200 && response.data) {
        setEditAckOrgUnitOptions(flattenOrgUnits(response.data));
      }
    } catch (error) {
      console.error('Ошибка загрузки отделов для ознакомления:', error);
    } finally {
      setLoadingEditAckOrgUnits(false);
    }
  };

  const searchEditAckEmployees = async (query: string) => {
    setEditAckSearchQuery(query);
    if (query.trim().length < 2) { setEditAckSearchResults([]); return; }
    setEditAckSearchLoading(true);
    try {
      const res = await searchSuggestHierarchy(query, 8);
      if (res.status === 200 && res.data) {
        setEditAckSearchResults(
          res.data.suggestions.filter(
            (s) => !editAckSelectedEmployees.some((item) => String(item.eid) === String(s.eid))
          )
        );
      }
    } finally {
      setEditAckSearchLoading(false);
    }
  };

  const addEditAckEmployee = (emp: ProfileSuggestion) => {
    setEditAckSelectedEmployees((prev) => [...prev, { eid: String(emp.eid), full_name: emp.full_name }]);
    setEditAckSearchQuery('');
    setEditAckSearchResults([]);
  };

  const removeEditAckEmployee = (eid: string) => {
    setEditAckSelectedEmployees((prev) => prev.filter((item) => item.eid !== eid));
  };

  const addEditAckOrgUnit = () => {
    const unit = editAckOrgUnitOptions.find((item) => String(item.id) === editAckOrgUnitToAdd);
    if (!unit) return;
    setEditAckSelectedOrgUnits((prev) => [...prev, unit]);
    setEditAckOrgUnitToAdd('');
  };

  const removeEditAckOrgUnit = (id: number) => {
    setEditAckSelectedOrgUnits((prev) => prev.filter((item) => item.id !== id));
  };

  const resetEditAckTargetsToAll = () => {
    setEditData((prev) => ({ ...prev, ack_target_all: true }));
    setEditAckSelectedEmployees([]);
    setEditAckSelectedOrgUnits([]);
    setEditAckOrgUnitToAdd('');
    setEditAckTargetMode('employees');
    setEditAckSearchQuery('');
    setEditAckSearchResults([]);
  };

  const openEditModal = async (newsDetail: NewsDetail) => {
    const cats = await getCategories();
    if (cats.status === 200 && cats.data) setEditCategories(cats.data);

    setEditData({
      title: newsDetail.title,
      short_description: newsDetail.short_description,
      content: newsDetail.content,
      category_ids: newsDetail.categories?.map((c) => c.id) ?? [],
      is_pinned: newsDetail.is_pinned,
      mandatory_ack: newsDetail.mandatory_ack,
      comments_enabled: newsDetail.comments_enabled,
      status: (newsDetail.status as NewsStatus) ?? 'PUBLISHED',
      tag_names: newsDetail.tags?.join(', ') ?? '',
      scheduled_publish_at_local: newsDetail.scheduled_publish_at
        ? new Date(newsDetail.scheduled_publish_at).toISOString().slice(0, 16)
        : '',
      expires_at_local: newsDetail.expires_at
        ? new Date(newsDetail.expires_at).toISOString().slice(0, 16)
        : '',
      file_ids: newsDetail.file_ids ?? [],
      ack_target_all: newsDetail.ack_target_all,
    });
    setEditAckSelectedEmployees([]);
    setEditAckTargetMode('employees');
    setEditAckSelectedOrgUnits([]);
    setEditAckOrgUnitToAdd('');
    setEditAckSearchQuery('');
    setEditAckSearchResults([]);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (newsId: number) => {
    if (!isNewsEditor) return;
    setSavingEdit(true);
    try {
      const parsedTags = editData.tag_names.split(',').map((t) => t.trim()).filter(Boolean);
      const payload: NewsUpdate = {
        title: editData.title?.trim(),
        short_description: editData.short_description?.trim(),
        content: editData.content?.trim(),
        category_ids: editData.category_ids,
        is_pinned: editData.is_pinned,
        mandatory_ack: editData.mandatory_ack,
        ack_target_all: editData.mandatory_ack ? editData.ack_target_all : true,
        ack_target_eids:
          editData.mandatory_ack && !editData.ack_target_all && editAckTargetMode === 'employees'
            ? editAckSelectedEmployees.map((e) => e.eid)
            : undefined,
        ack_target_org_unit_ids:
          editData.mandatory_ack && !editData.ack_target_all && editAckTargetMode === 'departments'
            ? editAckSelectedOrgUnits.map((unit) => unit.id)
            : undefined,
        comments_enabled: editData.comments_enabled,
        status: editData.status,
        scheduled_publish_at:
          editData.status === 'SCHEDULED' && editData.scheduled_publish_at_local
            ? new Date(editData.scheduled_publish_at_local).toISOString()
            : null,
        expires_at: editData.expires_at_local
          ? new Date(editData.expires_at_local).toISOString()
          : null,
        tag_names: parsedTags.length > 0 ? parsedTags : [],
        file_ids: editData.file_ids,
      };

      const response = await updateNews(newsId, payload);
      if (response.status === 200) {
        setShowEditModal(false);
        onSaved();
      } else {
        showAlert('Ошибка при сохранении новости', 'error');
      }
    } catch (err) {
      console.error('Ошибка обновления новости:', err);
      showAlert('Ошибка при сохранении новости', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const isSaveDisabled =
    savingEdit ||
    !editData.title?.trim() ||
    !editData.content?.trim() ||
    (editData.mandatory_ack && !editData.ack_target_all && editAckTargetMode === 'employees' && editAckSelectedEmployees.length === 0) ||
    (editData.mandatory_ack && !editData.ack_target_all && editAckTargetMode === 'departments' && editAckSelectedOrgUnits.length === 0);

  return {
    showEditModal,
    setShowEditModal,
    editData,
    setEditData,
    editCategories,
    savingEdit,
    isSaveDisabled,

    editAckSelectedEmployees,
    editAckTargetMode,
    setEditAckTargetMode,
    editAckOrgUnitOptions,
    editAckSelectedOrgUnits,
    editAckOrgUnitToAdd,
    setEditAckOrgUnitToAdd,
    loadingEditAckOrgUnits,
    editAckSearchQuery,
    editAckSearchResults,
    editAckSearchLoading,

    loadOrgUnitsForEditAck,
    searchEditAckEmployees,
    addEditAckEmployee,
    removeEditAckEmployee,
    addEditAckOrgUnit,
    removeEditAckOrgUnit,
    resetEditAckTargetsToAll,
    openEditModal,
    handleSaveEdit,
  };
};
