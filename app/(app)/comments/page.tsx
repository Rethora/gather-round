import { Suspense } from 'react';

import Loading from '@/app/loading';
import CommentList from '@/components/comments/CommentList';
import { getComments } from '@/lib/api/comments/queries';
import { getEvents } from '@/lib/api/events/queries';
import { checkAuth } from '@/lib/auth/utils';

export const revalidate = 0;

export default async function CommentsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Comments</h1>
        </div>
        <Comments />
      </div>
    </main>
  );
}

const Comments = async () => {
  await checkAuth();

  const { comments } = await getComments();
  const { events } = await getEvents();
  return (
    <Suspense fallback={<Loading />}>
      <CommentList comments={comments} events={events} />
    </Suspense>
  );
};
