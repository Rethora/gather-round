'use client';

import { useState } from 'react';
import { type CompleteEvent } from '@/lib/db/schema/events';
import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import EventForm from '@/components/events/EventForm';
import EventList from '@/components/events/EventList';
import { useOptimisticEvents } from '../../app/(app)/events/useOptimisticEvents';

interface HostingEventsClientProps {
  events: CompleteEvent[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
}

export default function HostingEventsClient({
  events,
  total,
  page,
  pageSize,
  search,
}: HostingEventsClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const { optimisticEvents, addOptimisticEvent } = useOptimisticEvents(events);

  const openCreateModal = () => {
    setCreateOpen(true);
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
  };

  return (
    <>
      <Modal open={createOpen} setOpen={setCreateOpen} title="Create Event">
        <EventForm
          closeModal={closeCreateModal}
          openModal={openCreateModal}
          addOptimistic={addOptimisticEvent}
        />
      </Modal>

      <div className="flex justify-between items-center mb-4">
        <h1 className="font-semibold text-2xl">Events I&apos;m Hosting</h1>
        <div className="absolute right-0 top-0 ">
          <Button onClick={openCreateModal} variant={'outline'}>
            +
          </Button>
        </div>
      </div>

      <EventList
        events={optimisticEvents}
        total={total}
        page={page}
        pageSize={pageSize}
        search={search}
        searchPlaceholder="Search events you're hosting..."
        emptyMessage="No events you're hosting. Create your first event to get started."
        eventType="hosting"
      />
    </>
  );
}
