'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/(app)/rsvps/useOptimisticRsvps';
import { type Rsvp } from '@/lib/db/schema/rsvps';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import RsvpForm from '@/components/rsvps/RsvpForm';
import { type Event, type EventId } from '@/lib/db/schema/events';

export default function OptimisticRsvp({
  rsvp,
  events,
  eventId,
}: {
  rsvp: Rsvp;

  events: Event[];
  eventId?: EventId;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Rsvp) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticRsvp, setOptimisticRsvp] = useOptimistic(rsvp);
  const updateRsvp: TAddOptimistic = input =>
    setOptimisticRsvp({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <RsvpForm
          rsvp={optimisticRsvp}
          events={events}
          eventId={eventId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateRsvp}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticRsvp.status}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          'bg-secondary p-4 rounded-lg break-all text-wrap',
          optimisticRsvp.id === 'optimistic' ? 'animate-pulse' : ''
        )}
      >
        {JSON.stringify(optimisticRsvp, null, 2)}
      </pre>
    </div>
  );
}
