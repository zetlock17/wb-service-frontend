import { useCallback, useState } from "react";
import type { AlertType } from "../components/common/AlertModal";

interface AlertState {
  isOpen: boolean;
  message: string;
  type: AlertType;
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showAlert = useCallback((message: string, type: AlertType = "info") => {
    setAlertState({ isOpen: true, message, type });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return { alertState, showAlert, closeAlert };
};
