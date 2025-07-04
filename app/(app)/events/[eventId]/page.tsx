import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getEventByIdWithRsvpsAndComments } from '@/lib/api/events/queries';
import OptimisticEvent from './OptimisticEvent';
import { checkAuth, getUserAuth } from '@/lib/auth/utils';
import RsvpList from '@/components/rsvps/RsvpList';
import CommentList from '@/components/comments/CommentList';

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
      <Event id={params.eventId} />
    </main>
  );
}

const Event = async ({ id }: { id: string }) => {
  await checkAuth();
  const { session } = await getUserAuth();
  const { event, rsvps, comments } = await getEventByIdWithRsvpsAndComments(id);

  if (!event) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="events" />
        <OptimisticEvent event={event} />
      </div>
      {session?.user.id === event.userId && (
        <div className="relative mt-8 mx-4">
          <h3 className="text-xl font-medium mb-4">
            {event.title}&apos;s Rsvps
          </h3>
          <RsvpList events={[]} eventId={event.id} rsvps={rsvps} />
        </div>
      )}

      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">
          {event.title}&apos;s Comments
        </h3>
        <CommentList events={[]} eventId={event.id} comments={comments} />
      </div>
    </Suspense>
  );
};
