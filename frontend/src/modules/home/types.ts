export type BirthdayFilter = "today" | "week" | "month";

export const birthdayOptions: readonly BirthdayFilter[] = ["today", "week", "month"];

export const birthdayLabels: Record<BirthdayFilter, string> = {
  today: "Сегодня",
  week: "Текущая неделя",
  month: "Текущий месяц",
};

export interface EditingField {
  section: "profile" | "projects" | "vacations";
  field?: string;
  index?: number;
}

export const profileFieldLabels: Record<string, string> = {
  full_name: "ФИО",
  position: "Должность",
  org_unit: "Подразделение",
  manager_eid: "Руководитель",
  hrbp_eid: "HR BP",
  personal_phone: "Личный телефон",
  work_phone: "Рабочий телефон",
  work_email: "Рабочая почта",
  telegram: "Telegram",
  about_me: "О себе",
};

export const getEditModalTitle = (editingField: EditingField | null): string => {
  if (!editingField) return "";
  if (editingField.section === "projects") {
    return editingField.field === "add" ? "Добавить проект" : "Редактировать проект";
  }
  if (editingField.section === "vacations") {
    return "Редактировать отпуск";
  }
  const label = profileFieldLabels[editingField.field ?? ""] ?? editingField.field ?? "";
  return label ? `Редактировать: ${label}` : "Редактировать";
};
