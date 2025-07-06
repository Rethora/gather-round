'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/(app)/events/useOptimisticEvents';
import { type Event } from '@/lib/db/schema/events';
import { type Session } from '@/lib/auth/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import EventForm from '@/components/events/EventForm';
import { cancelEventAction } from '@/lib/actions/events';
import { Badge } from '@/components/ui/badge';
import { Rsvp } from '@/lib/db/schema/rsvps';
import { RsvpStatus } from '@prisma/client';

export default function OptimisticEvent({
  event,
  session,
  rsvps,
}: {
  event: Event;
  session: Session;
  rsvps: Rsvp[];
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
  const guestsCount = rsvps.filter(
    rsvp => rsvp.status === RsvpStatus.YES
  ).length;

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

      {/* Hero Section with Background Image */}
      <div
        className={`relative mb-6 rounded-lg overflow-hidden ${
          optimisticEvent.imageUrl
            ? 'h-64'
            : 'h-32 bg-gradient-to-r from-blue-500 to-purple-600'
        }`}
      >
        {optimisticEvent.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${optimisticEvent.imageUrl})`,
            }}
          />
        )}

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content overlay */}
        <div className="relative h-full flex flex-col justify-between p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-3xl text-white flex items-center gap-2">
                {optimisticEvent.title}
                {optimisticEvent.isCanceled && (
                  <Badge variant="destructive">Canceled</Badge>
                )}
              </h1>
            </div>
            <div className="flex gap-2">
              {session.user.id === optimisticEvent.userId &&
                !optimisticEvent.isCanceled && (
                  <Button
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => setEditOpen(true)}
                  >
                    Edit
                  </Button>
                )}
              {session.user.id === optimisticEvent.userId &&
                !optimisticEvent.isCanceled && (
                  <Button
                    variant="destructive"
                    className="bg-red-600/80 hover:bg-red-700/80 text-white border-red-600/30"
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel
                  </Button>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-4">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="text-sm text-muted-foreground">
          {optimisticEvent.description &&
          optimisticEvent.description.trim().length > 0
            ? optimisticEvent.description
            : 'This event has no description'}
        </p>
      </div>
      <div className="flex flex-col mb-4">
        <h2 className="text-lg font-semibold">Location</h2>
        <p className="text-sm text-muted-foreground">
          {optimisticEvent.location}
        </p>
      </div>
      <div className="flex flex-col mb-4">
        <h2 className="text-lg font-semibold">Guests</h2>
        <p className="text-sm text-muted-foreground">
          {guestsCount} / {optimisticEvent.maxGuests}
        </p>
      </div>
    </div>
  );
}
