import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getCommentByIdWithMentions } from '@/lib/api/comments/queries';
import { getEvents } from '@/lib/api/events/queries';
import OptimisticComment from '@/app/(app)/comments/[commentId]/OptimisticComment';
import { checkAuth, getUserAuth } from '@/lib/auth/utils';

import { BackButton } from '@/components/shared/BackButton';
import Loading from '@/app/loading';

export const revalidate = 0;

export default async function CommentPage({
  params,
}: {
  params: { commentId: string };
}) {
  return (
    <main className="overflow-auto">
      <Comment id={params.commentId} />
    </main>
  );
}

const Comment = async ({ id }: { id: string }) => {
  await checkAuth();

  const { comment } = await getCommentByIdWithMentions(id);
  const { events } = await getEvents();
  const { session } = await getUserAuth();

  if (!comment) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="comments" />
        <OptimisticComment
          comment={comment}
          events={events}
          eventId={comment.eventId}
          session={session!}
        />
      </div>
    </Suspense>
  );
};
