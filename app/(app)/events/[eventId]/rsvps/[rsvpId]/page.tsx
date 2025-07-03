import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getRsvpById } from '@/lib/api/rsvps/queries';
import { getEvents } from '@/lib/api/events/queries';
import OptimisticRsvp from '@/app/(app)/rsvps/[rsvpId]/OptimisticRsvp';
import { checkAuth } from '@/lib/auth/utils';

import { BackButton } from '@/components/shared/BackButton';
import Loading from '@/app/loading';

export const revalidate = 0;

export default async function RsvpPage({
  params,
}: {
  params: { rsvpId: string };
}) {
  return (
    <main className="overflow-auto">
      <Rsvp id={params.rsvpId} />
    </main>
  );
}

const Rsvp = async ({ id }: { id: string }) => {
  await checkAuth();

  const { rsvp } = await getRsvpById(id);
  const { events } = await getEvents();

  if (!rsvp) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="rsvps" />
        <OptimisticRsvp rsvp={rsvp} events={events} eventId={rsvp.eventId} />
      </div>
    </Suspense>
  );
};
