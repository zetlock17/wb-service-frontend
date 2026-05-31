import { Upload, X } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Category, NewsStatus } from "../../../api/newsApi";
import type { useNewsForm } from "../hooks/useNewsForm";
import AckTargetSection from "./AckTargetSection";

type FormController = ReturnType<typeof useNewsForm>;

interface CreateNewsModalProps {
  categories: Category[];
  controller: FormController;
}

const STATUSES: NewsStatus[] = ['PUBLISHED', 'DRAFT', 'SCHEDULED'];

const statusButtonLabel = (s: NewsStatus) =>
  s === 'PUBLISHED' ? 'Опубликовать' : s === 'DRAFT' ? 'Черновик' : 'По расписанию';

const submitButtonLabel = (status: NewsStatus) =>
  status === 'DRAFT' ? 'Сохранить черновик' : status === 'SCHEDULED' ? 'Запланировать' : 'Опубликовать';

const statusButtonClass = (status: NewsStatus, isActive: boolean) => {
  if (!isActive) return 'bg-white text-gray-600 border-gray-200 hover:border-wb-green/40 hover:text-wb-green';
  if (status === 'DRAFT') return 'bg-gray-700 text-white border-gray-700';
  if (status === 'SCHEDULED') return 'bg-wb-pink-dark text-white border-wb-pink-dark';
  return 'bg-wb-green text-white border-wb-green';
};

const CreateNewsModal = ({ categories, controller }: CreateNewsModalProps) => {
  const {
    showCreateModal,
    closeModal,
    formData,
    setFormData,
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
  } = controller;

  return (
    <Modal
      isOpen={showCreateModal}
      title="Создать новость"
      onClose={closeModal}
      widthClass="max-w-2xl"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Заголовок <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-wb-green focus:ring-2 focus:ring-wb-green/20"
            placeholder="Введите заголовок новости"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание</label>
          <input
            type="text"
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-wb-green focus:ring-2 focus:ring-wb-green/20"
            placeholder="Краткое описание для списка новостей"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Содержание <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={8}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-wb-green focus:ring-2 focus:ring-wb-green/20"
            placeholder="Введите содержание новости"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
          {categories.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm text-gray-600">Сначала создайте категорию через "Управление категориями".</p>
            </div>
          ) : (
            <select
              value={formData.category_ids[0] ?? ''}
              onChange={(e) => setFormData({ ...formData, category_ids: [Number(e.target.value)] })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-wb-green focus:ring-2 focus:ring-wb-green/20"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-gray-50 p-3">
          {[
            { key: 'is_pinned' as const, label: 'Закрепить новость' },
            { key: 'mandatory_ack' as const, label: 'Обязательное ознакомление' },
            { key: 'comments_enabled' as const, label: 'Комментарии включены' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                formData[key]
                  ? 'border-wb-green bg-wb-green-light text-wb-green'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-wb-green/40'
              }`}
            >
              <input
                type="checkbox"
                checked={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-wb-green accent-wb-green focus:ring-wb-green"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {formData.mandatory_ack && (
          <AckTargetSection
            ackTargetAll={formData.ack_target_all}
            onSelectAll={resetAckTargetsToAll}
            onSelectCustom={() => setFormData({ ...formData, ack_target_all: false })}
            ackTargetMode={ackTargetMode}
            onChangeMode={async (mode) => {
              setAckTargetMode(mode);
              if (mode === 'departments') await loadOrgUnitsForAck();
            }}
            ackSearchQuery={ackSearchQuery}
            ackSearchResults={ackSearchResults}
            ackSearchLoading={ackSearchLoading}
            onSearch={searchAckEmployees}
            onAddEmployee={addAckEmployee}
            ackSelectedEmployees={ackSelectedEmployees}
            onRemoveEmployee={removeAckEmployee}
            ackOrgUnitOptions={ackOrgUnitOptions}
            ackSelectedOrgUnits={ackSelectedOrgUnits}
            ackOrgUnitToAdd={ackOrgUnitToAdd}
            onChangeOrgUnitToAdd={setAckOrgUnitToAdd}
            onLoadOrgUnits={loadOrgUnitsForAck}
            loadingAckOrgUnits={loadingAckOrgUnits}
            onAddOrgUnit={addAckOrgUnit}
            onRemoveOrgUnit={removeAckOrgUnit}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Статус публикации</label>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({ ...formData, status: s })}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${statusButtonClass(s, formData.status === s)}`}
              >
                {statusButtonLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {formData.status === 'SCHEDULED' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата и время публикации <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_publish_at}
              onChange={(e) => setFormData({ ...formData, scheduled_publish_at: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-wb-green focus:ring-2 focus:ring-wb-green/20"
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
              value={formData.tag_names}
              onChange={(e) => setFormData({ ...formData, tag_names: e.target.value })}
              placeholder="важно, обновление, кадры"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-wb-green focus:ring-2 focus:ring-wb-green/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата устаревания <span className="text-gray-400 font-normal">(необязательно)</span>
            </label>
            <input
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-wb-green focus:ring-2 focus:ring-wb-green/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Файлы</label>
          <div className="relative">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploadingFiles}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition hover:border-wb-green hover:bg-wb-green-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-4 w-4 text-wb-green" />
              <span className="text-sm font-medium text-gray-600">
                {uploadingFiles ? 'Загрузка...' : 'Выберите файлы'}
              </span>
            </label>
          </div>

          {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}

          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">Загруженные файлы:</p>
              <div className="space-y-1">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
          <button
            onClick={handleCreateNews}
            disabled={isCreateDisabled}
            className="flex-1 rounded-full bg-wb-green px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:translate-y-0"
          >
            {submitButtonLabel(formData.status)}
          </button>
          <button
            onClick={closeModal}
            className="rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateNewsModal;
