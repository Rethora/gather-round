import { Suspense } from 'react';

import Loading from '@/app/loading';
import NotificationList from '@/components/notifications/NotificationList';
import { getNotifications } from '@/lib/api/notifications/queries';
import PollingWrapper from '@/components/shared/PollingWrapper';

import { checkAuth } from '@/lib/auth/utils';

export const revalidate = 0;

export default async function NotificationsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Notifications</h1>
        </div>
        <PollingWrapper configKey="notifications">
          <Notifications />
        </PollingWrapper>
      </div>
    </main>
  );
}

const Notifications = async () => {
  await checkAuth();

  const { notifications } = await getNotifications();

  return (
    <Suspense fallback={<Loading />}>
      <NotificationList notifications={notifications} />
    </Suspense>
  );
};
