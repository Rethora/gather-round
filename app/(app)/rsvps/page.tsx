import { Suspense } from 'react';

import Loading from '@/app/loading';
import RsvpList from '@/components/rsvps/RsvpList';
import { getRsvps } from '@/lib/api/rsvps/queries';
import { getEvents } from '@/lib/api/events/queries';
import { checkAuth } from '@/lib/auth/utils';
import PollingWrapper from '@/components/shared/PollingWrapper';

export const revalidate = 0;

export default async function RsvpsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Rsvps</h1>
        </div>
        <PollingWrapper configKey="rsvps">
          <Rsvps />
        </PollingWrapper>
      </div>
    </main>
  );
}

const Rsvps = async () => {
  await checkAuth();

  const { rsvps } = await getRsvps();
  const { events } = await getEvents();

  return (
    <Suspense fallback={<Loading />}>
      <RsvpList rsvps={rsvps} events={events} />
    </Suspense>
  );
};
