import Modal from "../../../components/common/Modal";
import type { EditingField } from "../types";
import ProfileFieldEditor, {
  type EmployeeOption,
  type OrgUnitOption,
} from "./ProfileFieldEditor";

interface EditProfileModalProps {
  editingField: EditingField | null;
  values: Record<string, any>;
  setValues: (next: Record<string, any>) => void;
  orgUnitOptions: OrgUnitOption[];
  employeeOptions: EmployeeOption[];
  onSave: () => void;
  onCancel: () => void;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wb-green";

const ProjectFields = ({
  values,
  setValues,
}: {
  values: Record<string, any>;
  setValues: (next: Record<string, any>) => void;
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Название проекта</label>
      <input
        type="text"
        value={values.name || ""}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
        className={inputClass}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
      <input
        type="text"
        value={values.position || ""}
        onChange={(e) => setValues({ ...values, position: e.target.value })}
        className={inputClass}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
      <input
        type="date"
        value={values.start_d || ""}
        onChange={(e) => setValues({ ...values, start_d: e.target.value })}
        className={inputClass}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
      <input
        type="date"
        value={values.end_d || ""}
        onChange={(e) => setValues({ ...values, end_d: e.target.value })}
        className={inputClass}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка</label>
      <input
        type="text"
        value={values.link || ""}
        onChange={(e) => setValues({ ...values, link: e.target.value })}
        className={inputClass}
      />
    </div>
  </div>
);

const VacationFields = ({
  values,
  setValues,
}: {
  values: Record<string, any>;
  setValues: (next: Record<string, any>) => void;
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
      <input
        type="date"
        value={values.start_date || ""}
        onChange={(e) => setValues({ ...values, start_date: e.target.value })}
        className={inputClass}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
      <input
        type="date"
        value={values.end_date || ""}
        onChange={(e) => setValues({ ...values, end_date: e.target.value })}
        className={inputClass}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Замещение</label>
      <input
        type="text"
        value={values.substitute || ""}
        onChange={(e) => setValues({ ...values, substitute: e.target.value })}
        className={inputClass}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
      <textarea
        value={values.comment || ""}
        onChange={(e) => setValues({ ...values, comment: e.target.value })}
        rows={3}
        className={inputClass}
      />
    </div>
  </div>
);

const EditProfileModal = ({
  editingField,
  values,
  setValues,
  orgUnitOptions,
  employeeOptions,
  onSave,
  onCancel,
}: EditProfileModalProps) => {
  const showProjectFields =
    editingField?.section === "projects" &&
    (editingField.field === "add" || editingField.index !== undefined);
  const showVacationFields = editingField?.section === "vacations";

  return (
    <Modal
      isOpen={Boolean(editingField)}
      title={`Редактировать ${editingField?.field || editingField?.section || ""}`}
      onClose={onCancel}
      widthClass="max-w-md"
    >
      {editingField && (
        <div className="space-y-4">
          <ProfileFieldEditor
            editingField={editingField}
            values={values}
            setValues={setValues}
            orgUnitOptions={orgUnitOptions}
            employeeOptions={employeeOptions}
          />
          {showProjectFields && <ProjectFields values={values} setValues={setValues} />}
          {showVacationFields && <VacationFields values={values} setValues={setValues} />}
          <div className="flex gap-3">
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-wb-green text-white rounded-lg hover:bg-wb-green-dark"
            >
              Сохранить
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EditProfileModal;
