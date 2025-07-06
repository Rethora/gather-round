import NotificationDataTableClient from '@/components/notifications/NotificationDataTableClient';
import { getNotifications } from '@/lib/api/notifications/queries';
import PollingWrapper from '@/components/shared/PollingWrapper';
import { checkAuth } from '@/lib/auth/utils';
import { NotificationType } from '@prisma/client';

export const revalidate = 0;

interface NotificationsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
    type?: string;
  };
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Notifications</h1>
        </div>
        <PollingWrapper configKey="notifications">
          <Notifications searchParams={searchParams} />
        </PollingWrapper>
      </div>
    </main>
  );
}

const Notifications = async ({
  searchParams,
}: {
  searchParams: NotificationsPageProps['searchParams'];
}) => {
  await checkAuth();

  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;
  const search = searchParams.search || '';
  const status = (searchParams.status as 'all' | 'read' | 'unread') || 'all';
  const type = (searchParams.type as NotificationType | 'all') || 'all';

  const { notifications, total } = await getNotifications({
    page,
    pageSize,
    search,
    status,
    type,
  });

  return (
    <NotificationDataTableClient
      notifications={notifications}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      status={status}
      type={type}
    />
  );
};
