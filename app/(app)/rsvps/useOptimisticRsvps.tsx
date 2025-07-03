import { type Event } from "@/lib/db/schema/events";
import { type Rsvp, type CompleteRsvp } from "@/lib/db/schema/rsvps";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Rsvp>) => void;

export const useOptimisticRsvps = (
  rsvps: CompleteRsvp[],
  events: Event[]
) => {
  const [optimisticRsvps, addOptimisticRsvp] = useOptimistic(
    rsvps,
    (
      currentState: CompleteRsvp[],
      action: OptimisticAction<Rsvp>,
    ): CompleteRsvp[] => {
      const { data } = action;

      const optimisticEvent = events.find(
        (event) => event.id === data.eventId,
      )!;

      const optimisticRsvp = {
        ...data,
        event: optimisticEvent,
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticRsvp]
            : [...currentState, optimisticRsvp];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticRsvp } : item,
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

  return { addOptimisticRsvp, optimisticRsvps };
};
