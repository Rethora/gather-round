'use client';

import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { type Rsvp, CompleteRsvp } from '@/lib/db/schema/rsvps';
import Modal from '@/components/shared/Modal';
import { type Event, type EventId } from '@/lib/db/schema/events';
import { useOptimisticRsvps } from '@/app/(app)/rsvps/useOptimisticRsvps';
import { Button } from '@/components/ui/button';
import RsvpForm from './RsvpForm';
import { PlusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePollingContext } from '@/lib/hooks/usePollingContext';

type TOpenModal = (rsvp?: Rsvp) => void;

export default function RsvpList({
  rsvps,
  events,
  eventId,
}: {
  rsvps: CompleteRsvp[];
  events: Event[];
  eventId?: EventId;
}) {
  const { optimisticRsvps, addOptimisticRsvp } = useOptimisticRsvps(
    rsvps,
    events
  );
  const [open, setOpen] = useState(false);
  const [activeRsvp, setActiveRsvp] = useState<Rsvp | null>(null);
  const { pausePolling, resumePolling } = usePollingContext();

  const openModal = (rsvp?: Rsvp) => {
    setOpen(true);
    pausePolling();
    if (rsvp) setActiveRsvp(rsvp);
    else setActiveRsvp(null);
  };

  const closeModal = () => {
    setOpen(false);
    resumePolling();
  };

  const event = events.find(e => e.id === eventId);

  // Pause polling when modal is open, resume when closed
  useEffect(() => {
    if (open) {
      pausePolling();
    } else {
      resumePolling();
    }
  }, [open, pausePolling, resumePolling]);

  return (
    <div>
      <Modal
        open={open}
        setOpen={isOpen => {
          setOpen(isOpen);
          if (!isOpen) {
            resumePolling();
          }
        }}
        title={activeRsvp ? 'Edit Rsvp' : 'Create Rsvp'}
      >
        <RsvpForm
          rsvp={activeRsvp}
          addOptimistic={addOptimisticRsvp}
          openModal={openModal}
          closeModal={closeModal}
          events={events}
          eventId={eventId}
          existingRsvps={rsvps}
        />
      </Modal>
      {!event?.isCanceled && (
        <div className="absolute right-0 top-0 ">
          <Button onClick={() => openModal()} variant={'outline'}>
            +
          </Button>
        </div>
      )}
      {optimisticRsvps.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticRsvps.map(rsvp => (
            <Rsvp rsvp={rsvp} key={rsvp.id} openModal={openModal} />
          ))}
        </ul>
      )}
    </div>
  );
}

const Rsvp = ({
  rsvp,
  openModal: _,
}: {
  rsvp: CompleteRsvp;
  openModal: TOpenModal;
}) => {
  const optimistic = rsvp.id === 'optimistic';
  const deleting = rsvp.id === 'delete';
  const mutating = optimistic || deleting;

  return (
    <li
      className={cn(
        'flex justify-between my-2',
        mutating ? 'opacity-30 animate-pulse' : '',
        deleting ? 'text-destructive' : ''
      )}
    >
      <div className="w-full">
        <div className="flex gap-2">
          <Badge>{rsvp.status}</Badge>
          <div>{rsvp.invitee.email}</div>
        </div>
      </div>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No rsvps
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new rsvp.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Rsvps{' '}
        </Button>
      </div>
    </div>
  );
};
