import type { NavigateFunction } from "react-router-dom";
import { suggestEmployees } from "../../../api/profileApi";

export const openProfileByEid = (navigate: NavigateFunction, eid: number | string) => {
  navigate(`/profile/${eid}`);
};

export const openProfileByName = async (navigate: NavigateFunction, fullName: string) => {
  try {
    const response = await suggestEmployees(fullName, 10);
    if (response.status >= 200 && response.status < 300 && response.data?.suggestions?.length) {
      const normalized = fullName.trim().toLowerCase();
      const exact = response.data.suggestions.find(
        (item) => item.full_name.trim().toLowerCase() === normalized
      );
      const target = exact || response.data.suggestions[0];
      openProfileByEid(navigate, target.eid);
    }
  } catch (error) {
    console.error("Не удалось открыть профиль сотрудника:", error);
  }
};
