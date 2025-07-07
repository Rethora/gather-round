import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getEventByIdWithRsvpsWithUsersAndComments } from '@/lib/api/events/queries';
import { getUserRsvpForEvent, getEventCapacity } from '@/lib/api/rsvps/queries';
import OptimisticEvent from './OptimisticEvent';
import { checkAuth, getUserAuth } from '@/lib/auth/utils';
import RsvpList from '@/components/rsvps/RsvpList';
import RsvpStatusComponent from '@/components/rsvps/RsvpStatus';
import EventCommentSection from '@/components/events/EventCommentSection';
import PollingWrapper from '@/components/shared/PollingWrapper';
import QueryParamCleaner from '@/components/shared/QueryParamCleaner';

import { BackButton } from '@/components/shared/BackButton';
import Loading from '@/app/loading';

export const revalidate = 0;

export default async function EventPage({
  params,
}: {
  params: { eventId: string };
}) {
  return (
    <main className="overflow-auto">
      <PollingWrapper configKey="events">
        <Event id={params.eventId} />
      </PollingWrapper>
    </main>
  );
}

const Event = async ({ id }: { id: string }) => {
  await checkAuth();
  const { session } = await getUserAuth();
  const { event, rsvps, comments } =
    await getEventByIdWithRsvpsWithUsersAndComments(id);
  const { rsvp: userRsvp } = await getUserRsvpForEvent(id);
  const capacityInfo = await getEventCapacity(id);

  if (!event) notFound();

  // Determine the appropriate back path based on event type
  let backPath = '/events/hosting'; // default fallback
  if (session?.user.id === event.userId) {
    backPath = '/events/hosting';
  } else if (userRsvp) {
    backPath = '/events/attending';
  } else {
    backPath = '/events/public';
  }

  return (
    <Suspense fallback={<Loading />}>
      <QueryParamCleaner />
      <div className="relative">
        <BackButton currentResource="events" backPath={backPath} />
        <OptimisticEvent event={event} session={session!} rsvps={rsvps} />
      </div>

      <div className="max-w-3xl">
        {userRsvp && (
          <div className="relative mt-8 mx-4">
            <RsvpStatusComponent
              rsvp={userRsvp}
              capacityInfo={capacityInfo || null}
            />
          </div>
        )}

        {session?.user.id === event.userId && event.isPrivate && (
          <div className="relative mt-8 mx-4">
            <h3 className="text-xl font-medium mb-4">RSVP List</h3>
            <RsvpList events={[event]} eventId={event.id} rsvps={rsvps} />
          </div>
        )}

        <EventCommentSection
          events={[]}
          eventId={event.id}
          comments={comments}
          session={session!}
        />
      </div>
    </Suspense>
  );
};
