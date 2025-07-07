import { Suspense } from 'react';

import Loading from '@/app/loading';
import { getPublicEventsPaginated } from '@/lib/api/events/queries';
import { checkAuth } from '@/lib/auth/utils';
import EventList from '@/components/events/EventList';

export const revalidate = 0;

interface PublicEventsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    search?: string;
  };
}

export default async function PublicEventsPage({
  searchParams,
}: PublicEventsPageProps) {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Browse Public Events</h1>
        </div>
        <PublicEvents searchParams={searchParams} />
      </div>
    </main>
  );
}

const PublicEvents = async ({
  searchParams,
}: {
  searchParams: PublicEventsPageProps['searchParams'];
}) => {
  await checkAuth();

  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;
  const search = searchParams.search || '';

  const { events, total } = await getPublicEventsPaginated({
    page,
    pageSize,
    search,
  });

  return (
    <Suspense fallback={<Loading />}>
      <EventList
        events={events}
        total={total}
        page={page}
        pageSize={pageSize}
        search={search}
        searchPlaceholder="Search public events..."
        emptyMessage="No public events available at the moment."
        eventType="public"
      />
    </Suspense>
  );
};
