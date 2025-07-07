import { Suspense } from 'react';

import Loading from '@/app/loading';
import { getHostingEventsPaginated } from '@/lib/api/events/queries';
import { checkAuth } from '@/lib/auth/utils';
import HostingEventsClient from '@/components/events/HostingEventsClient';

export const revalidate = 0;

interface HostingEventsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    search?: string;
  };
}

export default async function HostingEventsPage({
  searchParams,
}: HostingEventsPageProps) {
  return (
    <main>
      <div className="relative">
        <HostingEvents searchParams={searchParams} />
      </div>
    </main>
  );
}

const HostingEvents = async ({
  searchParams,
}: {
  searchParams: HostingEventsPageProps['searchParams'];
}) => {
  await checkAuth();

  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;
  const search = searchParams.search || '';

  const { events, total } = await getHostingEventsPaginated({
    page,
    pageSize,
    search,
  });

  return (
    <Suspense fallback={<Loading />}>
      <HostingEventsClient
        events={events}
        total={total}
        page={page}
        pageSize={pageSize}
        search={search}
      />
    </Suspense>
  );
};
