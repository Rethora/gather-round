'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/(app)/events/useOptimisticEvents';
import { type Event } from '@/lib/db/schema/events';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import EventForm from '@/components/events/EventForm';

export default function OptimisticEvent({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Event) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticEvent, setOptimisticEvent] = useOptimistic(event);
  const updateEvent: TAddOptimistic = input =>
    setOptimisticEvent({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <EventForm
          event={optimisticEvent}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateEvent}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticEvent.title}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
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
