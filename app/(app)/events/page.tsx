import { Suspense } from 'react';

import Loading from '@/app/loading';
import EventList from '@/components/events/EventList';
import { getEvents } from '@/lib/api/events/queries';

import { checkAuth, getUserAuth } from '@/lib/auth/utils';

export const revalidate = 0;

export default async function EventsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Events</h1>
        </div>
        <Events />
      </div>
    </main>
  );
}

const Events = async () => {
  await checkAuth();
  const { session } = await getUserAuth();

  const { events } = await getEvents();

  return (
    <Suspense fallback={<Loading />}>
      <EventList events={events} session={session} />
    </Suspense>
  );
};
