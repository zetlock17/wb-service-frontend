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
