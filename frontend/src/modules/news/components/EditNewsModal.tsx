import Modal from "../../../components/common/Modal";
import type { NewsStatus } from "../../../api/newsApi";
import type { useEditNewsForm, EditFormData } from "../hooks/useEditNewsForm";
import AckTargetSection from "./AckTargetSection";

type EditController = ReturnType<typeof useEditNewsForm>;

interface EditNewsModalProps {
  newsId: number;
  controller: EditController;
}

const EDIT_STATUSES: NewsStatus[] = ['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'];

const statusLabel = (s: NewsStatus) =>
  s === 'PUBLISHED' ? 'Опубликовано'
    : s === 'DRAFT' ? 'Черновик'
    : s === 'SCHEDULED' ? 'По расписанию'
    : 'Архив';

const submitLabel = (data: EditFormData, saving: boolean) => {
  if (saving) return 'Сохранение...';
  if (data.status === 'PUBLISHED') return 'Опубликовать';
  if (data.status === 'DRAFT') return 'Сохранить черновик';
  if (data.status === 'SCHEDULED') return 'Запланировать';
  return 'Сохранить';
};

const activeStatusClass = (s: NewsStatus) => {
  if (s === 'DRAFT') return 'bg-gray-600 text-white border-gray-600';
  if (s === 'SCHEDULED') return 'bg-blue-600 text-white border-blue-600';
  if (s === 'ARCHIVED') return 'bg-yellow-600 text-white border-yellow-600';
  return 'bg-green-600 text-white border-green-600';
};

const EditNewsModal = ({ newsId, controller }: EditNewsModalProps) => {
  const {
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
    handleSaveEdit,
  } = controller;

  return (
    <Modal
      isOpen={showEditModal}
      title="Редактировать новость"
      onClose={() => setShowEditModal(false)}
      widthClass="max-w-2xl"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Заголовок <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание</label>
          <input
            type="text"
            value={editData.short_description}
            onChange={(e) => setEditData({ ...editData, short_description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Содержание <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={8}
            value={editData.content}
            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {editCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
            <select
              value={editData.category_ids[0] ?? ''}
              onChange={(e) => setEditData({ ...editData, category_ids: [Number(e.target.value)] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {editCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editData.is_pinned}
              onChange={(e) => setEditData({ ...editData, is_pinned: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Закрепить</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editData.mandatory_ack}
              onChange={(e) => setEditData({ ...editData, mandatory_ack: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Обязательное ознакомление</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editData.comments_enabled}
              onChange={(e) => setEditData({ ...editData, comments_enabled: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Комментарии включены</span>
          </label>
        </div>

        {editData.mandatory_ack && (
          <AckTargetSection
            ackTargetAll={editData.ack_target_all}
            onSelectAll={resetEditAckTargetsToAll}
            onSelectCustom={() => setEditData({ ...editData, ack_target_all: false })}
            ackTargetMode={editAckTargetMode}
            onChangeMode={async (mode) => {
              setEditAckTargetMode(mode);
              if (mode === 'departments') await loadOrgUnitsForEditAck();
            }}
            ackSearchQuery={editAckSearchQuery}
            ackSearchResults={editAckSearchResults}
            ackSearchLoading={editAckSearchLoading}
            onSearch={searchEditAckEmployees}
            onAddEmployee={addEditAckEmployee}
            ackSelectedEmployees={editAckSelectedEmployees}
            onRemoveEmployee={removeEditAckEmployee}
            ackOrgUnitOptions={editAckOrgUnitOptions}
            ackSelectedOrgUnits={editAckSelectedOrgUnits}
            ackOrgUnitToAdd={editAckOrgUnitToAdd}
            onChangeOrgUnitToAdd={setEditAckOrgUnitToAdd}
            onLoadOrgUnits={loadOrgUnitsForEditAck}
            loadingAckOrgUnits={loadingEditAckOrgUnits}
            onAddOrgUnit={addEditAckOrgUnit}
            onRemoveOrgUnit={removeEditAckOrgUnit}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
          <div className="flex gap-2 flex-wrap">
            {EDIT_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setEditData({ ...editData, status: s })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  editData.status === s
                    ? activeStatusClass(s)
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {editData.status === 'SCHEDULED' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата публикации <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={editData.scheduled_publish_at_local}
              onChange={(e) => setEditData({ ...editData, scheduled_publish_at_local: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Теги <span className="text-gray-400 font-normal">(через запятую)</span>
            </label>
            <input
              type="text"
              value={editData.tag_names}
              onChange={(e) => setEditData({ ...editData, tag_names: e.target.value })}
              placeholder="важно, обновление"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата устаревания <span className="text-gray-400 font-normal">(необязательно)</span>
            </label>
            <input
              type="datetime-local"
              value={editData.expires_at_local}
              onChange={(e) => setEditData({ ...editData, expires_at_local: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleSaveEdit(newsId)}
            disabled={isSaveDisabled}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitLabel(editData, savingEdit)}
          </button>
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditNewsModal;
