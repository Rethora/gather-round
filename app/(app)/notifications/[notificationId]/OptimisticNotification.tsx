'use client';

import { useOptimistic } from 'react';
import { type Notification } from '@/lib/db/schema/notifications';

import StyledLink from '@/components/StyledLink';

export default function OptimisticNotification({
  notification,
}: {
  notification: Notification;
}) {
  const [optimisticNotification] = useOptimistic(notification);

  return (
    <div className="m-4">
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
          <StyledLink href={`/events/view/${optimisticNotification.eventId}`}>
            View Event
          </StyledLink>
        </div>
      )}
      {optimisticNotification.commentId && (
        <div className="mt-4">
          <StyledLink
            href={`/events/view/${optimisticNotification.eventId}?commentId=${optimisticNotification.commentId}`}
          >
            View Comment
          </StyledLink>
        </div>
      )}
    </div>
  );
}
