import { Suspense } from 'react';

import Loading from '@/app/loading';
import { getAttendingEventsPaginated } from '@/lib/api/events/queries';
import { checkAuth, getUserAuth } from '@/lib/auth/utils';
import EventList from '@/components/events/EventList';

export const revalidate = 0;

interface AttendingEventsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    search?: string;
  };
}

export default async function AttendingEventsPage({
  searchParams,
}: AttendingEventsPageProps) {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">
            Events I&apos;m Attending
          </h1>
        </div>
        <AttendingEvents searchParams={searchParams} />
      </div>
    </main>
  );
}

const AttendingEvents = async ({
  searchParams,
}: {
  searchParams: AttendingEventsPageProps['searchParams'];
}) => {
  await checkAuth();
  const { session } = await getUserAuth();

  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;
  const search = searchParams.search || '';

  const { events, total } = await getAttendingEventsPaginated({
    page,
    pageSize,
    search,
  });

  return (
    <Suspense fallback={<Loading />}>
      <EventList
        events={events}
        session={session!}
        total={total}
        page={page}
        pageSize={pageSize}
        search={search}
        searchPlaceholder="Search events you're attending..."
        emptyMessage="No events you're attending. You haven't RSVP'd to any events yet."
        eventType="attending"
      />
    </Suspense>
  );
};
