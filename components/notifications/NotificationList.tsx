'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  type Notification,
  CompleteNotification,
} from '@/lib/db/schema/notifications';

import { useOptimisticNotifications } from '@/app/(app)/notifications/useOptimisticNotifications';
import { Mail, MailOpen } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function NotificationList({
  notifications,
}: {
  notifications: CompleteNotification[];
}) {
  const { optimisticNotifications } = useOptimisticNotifications(notifications);

  return (
    <div>
      {optimisticNotifications.length === 0 ? (
        <EmptyState />
      ) : (
        <ul>
          {optimisticNotifications.map(notification => (
            <Notification notification={notification} key={notification.id} />
          ))}
        </ul>
      )}
    </div>
  );
}

const UnReadNotification = ({
  notification,
}: {
  notification: CompleteNotification;
}) => {
  const pathname = usePathname();
  const basePath = pathname.includes('notifications')
    ? pathname
    : pathname + '/notifications/';

  return (
    <Link href={basePath + '/' + notification.id}>
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {notification.title}
          </CardTitle>
          <CardDescription>{notification.message}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

const ReadNotification = ({
  notification,
}: {
  notification: CompleteNotification;
}) => {
  const pathname = usePathname();
  const basePath = pathname.includes('notifications')
    ? pathname
    : pathname + '/notifications/';

  return (
    <Link href={basePath + '/' + notification.id}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailOpen className="h-4 w-4" />
            {notification.title}
          </CardTitle>
          <CardDescription>{notification.message}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

const Notification = ({
  notification,
}: {
  notification: CompleteNotification;
}) => {
  const optimistic = notification.id === 'optimistic';
  const deleting = notification.id === 'delete';
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
        {notification.isRead ? (
          <ReadNotification notification={notification} />
        ) : (
          <UnReadNotification notification={notification} />
        )}
      </div>
    </li>
  );
};

const EmptyState = () => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No notifications
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        You have no notifications at this time.
      </p>
    </div>
  );
};
