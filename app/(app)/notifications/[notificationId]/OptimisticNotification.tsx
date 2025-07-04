'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/(app)/notifications/useOptimisticNotifications';
import { type Notification } from '@/lib/db/schema/notifications';

import Modal from '@/components/shared/Modal';
import NotificationForm from '@/components/notifications/NotificationForm';
import StyledLink from '@/components/StyledLink';

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
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl">
          {optimisticNotification.title}
        </h1>
        <h2 className="text-sm text-muted-foreground">
          {optimisticNotification.message}
        </h2>
      </div>
      {optimisticNotification.eventId && (
        <div className="mt-4">
          <StyledLink href={`/events/${optimisticNotification.eventId}`}>
            View Event
          </StyledLink>
        </div>
      )}
      {optimisticNotification.commentId && (
        <div className="mt-4">
          <StyledLink href={`/comments/${optimisticNotification.commentId}`}>
            View Comment
          </StyledLink>
        </div>
      )}
    </div>
  );
}
