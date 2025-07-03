'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/(app)/notifications/useOptimisticNotifications';
import { type Notification } from '@/lib/db/schema/notifications';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import NotificationForm from '@/components/notifications/NotificationForm';

export default function OptimisticNotification({
  notification,
}: {
  notification: Notification;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Notification) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticNotification, setOptimisticNotification] =
    useOptimistic(notification);
  const updateNotification: TAddOptimistic = input =>
    setOptimisticNotification({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <NotificationForm
          notification={optimisticNotification}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateNotification}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">
          {optimisticNotification.type}
        </h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          'bg-secondary p-4 rounded-lg break-all text-wrap',
          optimisticNotification.id === 'optimistic' ? 'animate-pulse' : ''
        )}
      >
        {JSON.stringify(optimisticNotification, null, 2)}
      </pre>
    </div>
  );
}
