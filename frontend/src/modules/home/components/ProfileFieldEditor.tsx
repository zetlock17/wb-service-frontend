import type { EditingField } from "../types";

export interface OrgUnitOption {
  value: number;
  label: string;
}

export interface EmployeeOption {
  value: string;
  label: string;
  name: string;
}

interface ProfileFieldEditorProps {
  editingField: EditingField;
  values: Record<string, any>;
  setValues: (next: Record<string, any>) => void;
  orgUnitOptions: OrgUnitOption[];
  employeeOptions: EmployeeOption[];
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wb-green";
const selectClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-wb-green";

const ProfileFieldEditor = ({
  editingField,
  values,
  setValues,
  orgUnitOptions,
  employeeOptions,
}: ProfileFieldEditorProps) => {
  if (editingField.section !== "profile" || !editingField.field) return null;

  const text = (field: string, label: string, type: "text" | "email" = "text") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={values[field] || ""}
        onChange={(e) => setValues({ ...values, [field]: e.target.value })}
        className={inputClass}
      />
    </div>
  );

  switch (editingField.field) {
    case "full_name":
      return text("full_name", "ФИО");
    case "position":
      return text("position", "Должность");
    case "work_phone":
      return text("work_phone", "Рабочий телефон");
    case "work_email":
      return text("work_email", "Рабочая почта", "email");
    case "personal_phone":
      return text("personal_phone", "Личный телефон");
    case "telegram":
      return text("telegram", "Telegram");
    case "about_me":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
          <textarea
            value={values.about_me || ""}
            onChange={(e) => setValues({ ...values, about_me: e.target.value })}
            rows={4}
            className={inputClass}
          />
        </div>
      );
    case "org_unit":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
          <select
            value={values.org_unit_id ?? ""}
            onChange={(e) => {
              const nextValue = e.target.value ? Number(e.target.value) : null;
              const selectedUnit = orgUnitOptions.find((unit) => unit.value === nextValue);
              setValues({
                ...values,
                org_unit_id: nextValue,
                org_unit: selectedUnit?.label || "",
              });
            }}
            className={selectClass}
          >
            <option value="">Выберите подразделение</option>
            {orgUnitOptions.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "manager_eid":
    case "hrbp_eid": {
      const isManager = editingField.field === "manager_eid";
      const idField = isManager ? "manager_eid" : "hrbp_eid";
      const nameField = isManager ? "manager_name" : "hr_name";
      const label = isManager ? "Руководитель" : "HR BP";
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <select
            value={values[idField] || ""}
            onChange={(e) => {
              const nextValue = e.target.value || "";
              const selectedEmployee = employeeOptions.find((employee) => employee.value === nextValue);
              setValues({
                ...values,
                [idField]: nextValue,
                [nameField]: selectedEmployee?.name || "",
              });
            }}
            className={selectClass}
          >
            <option value="">Выберите {label}</option>
            {employeeOptions.map((employee) => (
              <option key={employee.value} value={employee.value}>
                {employee.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
    default:
      return null;
  }
};

export default ProfileFieldEditor;
