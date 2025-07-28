import { useEffect } from "react";
import { useDataStore } from "../store/dataStore";

// хук для предварительной загрузки данных
export const usePreloadData = () => {
  const { isInitialized, loadAllData } = useDataStore();

  useEffect(() => {
    // загружаем данные при первом рендере приложения
    if (!isInitialized) {
      loadAllData();
    }
  }, [isInitialized, loadAllData]);

  return { isInitialized };
};
