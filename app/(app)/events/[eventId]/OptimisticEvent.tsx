'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/(app)/events/useOptimisticEvents';
import { type Event } from '@/lib/db/schema/events';
import { cn } from '@/lib/utils';
import { type Session } from '@/lib/auth/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import EventForm from '@/components/events/EventForm';
import { cancelEventAction } from '@/lib/actions/events';
import { Badge } from '@/components/ui/badge';

export default function OptimisticEvent({
  event,
  session,
}: {
  event: Event;
  session: Session;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const openEditModal = (_?: Event) => {
    setEditOpen(true);
  };
  const closeEditModal = () => setEditOpen(false);
  const closeCancelModal = () => setCancelOpen(false);
  const [optimisticEvent, setOptimisticEvent] = useOptimistic(event);
  const updateEvent: TAddOptimistic = input =>
    setOptimisticEvent({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={editOpen} setOpen={setEditOpen}>
        <EventForm
          event={optimisticEvent}
          closeModal={closeEditModal}
          openModal={openEditModal}
          addOptimistic={updateEvent}
        />
      </Modal>
      <Modal open={cancelOpen} setOpen={setCancelOpen} title="Cancel Event">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">
            Are you sure you want to cancel this event?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeCancelModal}>
              No
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                // Optimistically update the event to show it as canceled
                updateEvent({
                  action: 'update',
                  data: {
                    ...optimisticEvent,
                    isCanceled: true,
                  },
                });

                // Call the server action to actually cancel the event
                await cancelEventAction(optimisticEvent.id);

                closeCancelModal();
              }}
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl flex items-center gap-2">
          {optimisticEvent.title}
          {optimisticEvent.isCanceled && (
            <Badge variant="destructive">Canceled</Badge>
          )}
        </h1>
        <div className="flex gap-2">
          {session.user.id === optimisticEvent.userId &&
            !optimisticEvent.isCanceled && (
              <Button className="" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
            )}
          {session.user.id === optimisticEvent.userId &&
            !optimisticEvent.isCanceled && (
              <Button
                variant="destructive"
                className=""
                onClick={() => setCancelOpen(true)}
              >
                Cancel
              </Button>
            )}
        </div>
      </div>
      <pre
        className={cn(
          'bg-secondary p-4 rounded-lg break-all text-wrap',
          optimisticEvent.id === 'optimistic' ? 'animate-pulse' : ''
        )}
      >
        {JSON.stringify(optimisticEvent, null, 2)}
      </pre>
    </div>
  );
}
