import { db } from '@/lib/db/index';
import { getUserAuth } from '@/lib/auth/utils';
import { type CommentId, commentIdSchema } from '@/lib/db/schema/comments';

export const getComments = async () => {
  const { session } = await getUserAuth();
  const c = await db.comment.findMany({
    where: { userId: session?.user.id },
    include: { event: true },
  });
  return { comments: c };
};

export const getCommentById = async (id: CommentId) => {
  const { session } = await getUserAuth();
  const { id: commentId } = commentIdSchema.parse({ id });
  const c = await db.comment.findFirst({
    where: { id: commentId, userId: session?.user.id },
    include: { event: true },
  });
  return { comment: c };
};

export const getCommentByIdWithMentions = async (id: CommentId) => {
  const { session } = await getUserAuth();
  const { id: commentId } = commentIdSchema.parse({ id });
  const c = await db.comment.findFirst({
    where: { id: commentId, userId: session?.user.id },
    include: {
      event: { include: { comments: true } },
      mentions: { include: { comment: true } },
    },
  });
  if (c === null) return { comment: null };
  const { event, mentions, ...comment } = c;

  return { comment, event: event, mentions: mentions };
};
