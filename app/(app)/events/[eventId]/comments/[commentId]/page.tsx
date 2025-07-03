import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getCommentByIdWithMentions } from '@/lib/api/comments/queries';
import { getEvents } from '@/lib/api/events/queries';
import OptimisticComment from '@/app/(app)/comments/[commentId]/OptimisticComment';
import { checkAuth } from '@/lib/auth/utils';
import MentionList from '@/components/mentions/MentionList';

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

  const { comment, mentions } = await getCommentByIdWithMentions(id);
  const { events } = await getEvents();

  if (!comment) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="comments" />
        <OptimisticComment
          comment={comment}
          events={events}
          eventId={comment.eventId}
        />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">
          {comment.content}&apos;s Mentions
        </h3>
        <MentionList comments={[]} commentId={comment.id} mentions={mentions} />
      </div>
    </Suspense>
  );
};
