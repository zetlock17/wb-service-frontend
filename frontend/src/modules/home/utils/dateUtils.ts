import type { ProfileVacation } from "../../../types/portal";

export const formatDate = (dateStr: string, mode?: "my" | "dm"): string => {
  const date = new Date(dateStr);
  switch (mode) {
    case "my":
      return date
        .toLocaleDateString("ru-RU", { month: "short", year: "numeric" })
        .replace(/[.,г]/g, "")
        .trim()
        .replace(/^./, (char) => char.toUpperCase());
    case "dm":
      return date
        .toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })
        .replace(/[.,]/g, "")
        .trim();
  }
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const formatBirthdayDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYearBirthday = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  const daysDiff = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) return "Сегодня";
  if (daysDiff === 1) return "Завтра";
  return thisYearBirthday.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
};

export const isBirthdayToday = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getDate() === now.getDate() && date.getMonth() === now.getMonth();
};

export const getVacationStatus = (vacation: ProfileVacation): "active" | "planned" => {
  const now = new Date();
  const start = new Date(vacation.start_date);
  const end = new Date(vacation.end_date);
  if (now >= start && now <= end) return "active";
  return "planned";
};
