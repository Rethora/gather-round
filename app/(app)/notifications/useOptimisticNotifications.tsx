
import { type Notification, type CompleteNotification } from "@/lib/db/schema/notifications";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Notification>) => void;

export const useOptimisticNotifications = (
  notifications: CompleteNotification[],
  
) => {
  const [optimisticNotifications, addOptimisticNotification] = useOptimistic(
    notifications,
    (
      currentState: CompleteNotification[],
      action: OptimisticAction<Notification>,
    ): CompleteNotification[] => {
      const { data } = action;

      

      const optimisticNotification = {
        ...data,
        
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticNotification]
            : [...currentState, optimisticNotification];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticNotification } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: "delete" } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticNotification, optimisticNotifications };
};
