import { type Event, type CompleteEvent } from '@/lib/db/schema/events';
import { OptimisticAction } from '@/lib/utils';
import { useOptimistic } from 'react';

export type TAddOptimistic = (action: OptimisticAction<Event>) => void;

export const useOptimisticEvents = (events: CompleteEvent[]) => {
  const [optimisticEvents, addOptimisticEvent] = useOptimistic(
    events,
    (
      currentState: CompleteEvent[],
      action: OptimisticAction<Event>
    ): CompleteEvent[] => {
      const { data } = action;

      const optimisticEvent = {
        ...data,

        id: 'optimistic',
      };

      switch (action.action) {
        case 'create':
          return currentState.length === 0
            ? [optimisticEvent]
            : [...currentState, optimisticEvent];
        case 'update':
          return currentState.map(item =>
            item.id === data.id ? { ...item, ...optimisticEvent } : item
          );
        case 'delete':
          return currentState.map(item =>
            item.id === data.id ? { ...item, id: 'delete' } : item
          );
        default:
          return currentState;
      }
    }
  );

  return { addOptimisticEvent, optimisticEvents };
};
