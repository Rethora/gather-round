import { type Event } from "@/lib/db/schema/events";
import { type Comment, type CompleteComment } from "@/lib/db/schema/comments";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Comment>) => void;

export const useOptimisticComments = (
  comments: CompleteComment[],
  events: Event[]
) => {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (
      currentState: CompleteComment[],
      action: OptimisticAction<Comment>,
    ): CompleteComment[] => {
      const { data } = action;

      const optimisticEvent = events.find(
        (event) => event.id === data.eventId,
      )!;

      const optimisticComment = {
        ...data,
        event: optimisticEvent,
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticComment]
            : [...currentState, optimisticComment];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticComment } : item,
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

  return { addOptimisticComment, optimisticComments };
};
