'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { markNotificationsAsReadAction } from '@/lib/actions/notifications';
import NotificationDataTable from './NotificationDataTable';
import { type CompleteNotification } from '@/lib/db/schema/notifications';
import { NotificationType } from '@prisma/client';

interface NotificationDataTableClientProps {
  notifications: CompleteNotification[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: 'all' | 'read' | 'unread';
  type: NotificationType | 'all';
}

export default function NotificationDataTableClient(
  props: NotificationDataTableClientProps
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to update URL query params
  function setQuery(newParams: Partial<Record<string, string | number>>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        value === 'all'
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  const handleBulkMarkAsRead = async (notificationIds: string[]) => {
    try {
      await markNotificationsAsReadAction(notificationIds);
      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      // You could add toast notification here
    }
  };

  return (
    <NotificationDataTable
      {...props}
      onPageChange={page => setQuery({ page })}
      onPageSizeChange={pageSize => setQuery({ pageSize, page: 1 })}
      onSearchChange={search => setQuery({ search, page: 1 })}
      onStatusChange={status => setQuery({ status, page: 1 })}
      onTypeChange={type => setQuery({ type, page: 1 })}
      onBulkMarkAsRead={handleBulkMarkAsRead}
    />
  );
}
