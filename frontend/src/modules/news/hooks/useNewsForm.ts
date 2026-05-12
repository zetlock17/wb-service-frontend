import { useCallback, useEffect, useState } from "react";
import { createNews, type Category } from "../../../api/newsApi";
import { uploadPhoto } from "../../../api/filesApi";
import {
  getOrgHierarchy,
  searchSuggestHierarchy,
  type ProfileSuggestion,
} from "../../../api/orgStructureApi";
import type {
  AckEmployee,
  AckOrgUnit,
  AckTargetMode,
  NewNewsFormState,
  UploadedFile,
} from "../types";
import { createInitialFormState } from "../constants";
import { flattenOrgUnits, toApiDateTime } from "../utils";

interface UseNewsFormParams {
  categories: Category[];
  isNewsEditor: boolean;
  hasCurrentUser: boolean;
  showAlert: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onCreated: () => void;
}

export const useNewsForm = ({
  categories,
  isNewsEditor,
  hasCurrentUser,
  showAlert,
  onCreated,
}: UseNewsFormParams) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<NewNewsFormState>(() => createInitialFormState());

  const [ackSelectedEmployees, setAckSelectedEmployees] = useState<AckEmployee[]>([]);
  const [ackTargetMode, setAckTargetMode] = useState<AckTargetMode>('employees');
  const [ackOrgUnitOptions, setAckOrgUnitOptions] = useState<AckOrgUnit[]>([]);
  const [ackSelectedOrgUnits, setAckSelectedOrgUnits] = useState<AckOrgUnit[]>([]);
  const [ackOrgUnitToAdd, setAckOrgUnitToAdd] = useState<string>('');
  const [loadingAckOrgUnits, setLoadingAckOrgUnits] = useState(false);
  const [ackSearchQuery, setAckSearchQuery] = useState('');
  const [ackSearchResults, setAckSearchResults] = useState<ProfileSuggestion[]>([]);
  const [ackSearchLoading, setAckSearchLoading] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Default the form's selected category to the first available one (or keep current if still valid).
  useEffect(() => {
    setFormData((prev) => {
      const currentId = prev.category_ids[0];
      const stillValid = currentId && categories.some((c) => c.id === currentId);
      if (stillValid) return prev;
      const nextId = categories[0]?.id;
      return { ...prev, category_ids: nextId ? [nextId] : [] };
    });
  }, [categories]);

  const resetForm = useCallback(() => {
    setFormData(createInitialFormState(categories[0]?.id));
    setAckSelectedEmployees([]);
    setAckTargetMode('employees');
    setAckSelectedOrgUnits([]);
    setAckOrgUnitToAdd('');
    setAckSearchQuery('');
    setAckSearchResults([]);
    setUploadedFiles([]);
    setUploadError(null);
  }, [categories]);

  const closeModal = useCallback(() => {
    setShowCreateModal(false);
    resetForm();
  }, [resetForm]);

  const loadOrgUnitsForAck = useCallback(async () => {
    if (ackOrgUnitOptions.length > 0 || loadingAckOrgUnits) return;
    setLoadingAckOrgUnits(true);
    try {
      const response = await getOrgHierarchy();
      if (response.status === 200 && response.data) {
        setAckOrgUnitOptions(flattenOrgUnits(response.data));
      }
    } catch (error) {
      console.error('Ошибка загрузки отделов для ознакомления:', error);
    } finally {
      setLoadingAckOrgUnits(false);
    }
  }, [ackOrgUnitOptions.length, loadingAckOrgUnits]);

  const searchAckEmployees = async (query: string) => {
    setAckSearchQuery(query);
    if (query.trim().length < 2) {
      setAckSearchResults([]);
      return;
    }
    setAckSearchLoading(true);
    try {
      const res = await searchSuggestHierarchy(query, 8);
      if (res.status === 200 && res.data) {
        setAckSearchResults(
          res.data.suggestions.filter(
            (s) => !ackSelectedEmployees.some((item) => String(item.eid) === String(s.eid))
          )
        );
      }
    } finally {
      setAckSearchLoading(false);
    }
  };

  const addAckEmployee = (employee: ProfileSuggestion) => {
    setAckSelectedEmployees((prev) => [
      ...prev,
      { eid: String(employee.eid), full_name: employee.full_name },
    ]);
    setAckSearchQuery('');
    setAckSearchResults([]);
  };

  const removeAckEmployee = (eid: string) => {
    setAckSelectedEmployees((prev) => prev.filter((item) => item.eid !== eid));
  };

  const addAckOrgUnit = () => {
    const unit = ackOrgUnitOptions.find((item) => String(item.id) === ackOrgUnitToAdd);
    if (!unit) return;
    setAckSelectedOrgUnits((prev) => [...prev, unit]);
    setAckOrgUnitToAdd('');
  };

  const removeAckOrgUnit = (id: number) => {
    setAckSelectedOrgUnits((prev) => prev.filter((item) => item.id !== id));
  };

  const resetAckTargetsToAll = () => {
    setFormData((prev) => ({ ...prev, ack_target_all: true }));
    setAckSelectedEmployees([]);
    setAckSelectedOrgUnits([]);
    setAckOrgUnitToAdd('');
    setAckTargetMode('employees');
    setAckSearchQuery('');
    setAckSearchResults([]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !hasCurrentUser) return;

    setUploadingFiles(true);
    setUploadError(null);

    try {
      for (const file of Array.from(files)) {
        const response = await uploadPhoto(file, undefined, 'document');
        if (response.status === 200 && response.data) {
          setUploadedFiles((prev) => [...prev, { id: response.data, name: file.name }]);
          setFormData((prev) => ({ ...prev, file_ids: [...prev.file_ids, response.data] }));
        } else {
          throw new Error(response.message || `Ошибка загрузки файла ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
      setUploadError(error instanceof Error ? error.message : 'Ошибка при загрузке файлов');
    } finally {
      setUploadingFiles(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeUploadedFile = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setFormData((prev) => ({
      ...prev,
      file_ids: prev.file_ids.filter((id) => id !== fileId),
    }));
  };

  const isCreateDisabled =
    !isNewsEditor ||
    formData.title.trim().length < 5 ||
    !formData.short_description.trim() ||
    !formData.content.trim() ||
    formData.category_ids.length === 0 ||
    (formData.status === 'SCHEDULED' && !formData.scheduled_publish_at) ||
    (formData.mandatory_ack && !formData.ack_target_all && ackTargetMode === 'employees' && ackSelectedEmployees.length === 0) ||
    (formData.mandatory_ack && !formData.ack_target_all && ackTargetMode === 'departments' && ackSelectedOrgUnits.length === 0);

  const handleCreateNews = async () => {
    if (!hasCurrentUser || !isNewsEditor) return;

    const title = formData.title.trim();
    const shortDescription = formData.short_description.trim();
    const content = formData.content.trim();

    if (title.length < 5) return showAlert('Заголовок должен быть не короче 5 символов', 'warning');
    if (!shortDescription) return showAlert('Краткое описание обязательно', 'warning');
    if (!content) return showAlert('Содержание обязательно', 'warning');
    if (formData.category_ids.length === 0) return showAlert('Выберите категорию для новости', 'warning');

    try {
      const parsedTags = formData.tag_names
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const response = await createNews({
        title,
        short_description: shortDescription,
        content,
        category_ids: formData.category_ids,
        is_pinned: formData.is_pinned,
        mandatory_ack: formData.mandatory_ack,
        ack_target_all: formData.mandatory_ack ? formData.ack_target_all : true,
        ack_target_eids:
          formData.mandatory_ack && !formData.ack_target_all && ackTargetMode === 'employees'
            ? ackSelectedEmployees.map((e) => e.eid)
            : undefined,
        ack_target_org_unit_ids:
          formData.mandatory_ack && !formData.ack_target_all && ackTargetMode === 'departments'
            ? ackSelectedOrgUnits.map((unit) => unit.id)
            : undefined,
        comments_enabled: formData.comments_enabled,
        status: formData.status,
        scheduled_publish_at:
          formData.status === 'SCHEDULED' && formData.scheduled_publish_at
            ? toApiDateTime(formData.scheduled_publish_at)
            : null,
        expires_at: toApiDateTime(formData.expires_at),
        tag_names: parsedTags.length > 0 ? parsedTags : undefined,
        file_ids: formData.file_ids.length > 0 ? formData.file_ids : undefined,
      });

      if (response.status === 200) {
        closeModal();
        onCreated();
      }
    } catch (error) {
      console.error('Ошибка создания новости:', error);
      showAlert('Произошла ошибка при создании новости', 'error');
    }
  };

  return {
    showCreateModal,
    setShowCreateModal,
    formData,
    setFormData,
    closeModal,
    isCreateDisabled,
    handleCreateNews,

    ackSelectedEmployees,
    ackTargetMode,
    setAckTargetMode,
    ackOrgUnitOptions,
    ackSelectedOrgUnits,
    ackOrgUnitToAdd,
    setAckOrgUnitToAdd,
    loadingAckOrgUnits,
    ackSearchQuery,
    ackSearchResults,
    ackSearchLoading,
    loadOrgUnitsForAck,
    searchAckEmployees,
    addAckEmployee,
    removeAckEmployee,
    addAckOrgUnit,
    removeAckOrgUnit,
    resetAckTargetsToAll,

    uploadedFiles,
    uploadingFiles,
    uploadError,
    handleFileUpload,
    removeUploadedFile,
  };
};
