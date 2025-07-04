import { db } from '@/lib/db/index';
import {
  CommentId,
  NewCommentParams,
  UpdateCommentParams,
  updateCommentSchema,
  insertCommentSchema,
  commentIdSchema,
} from '@/lib/db/schema/comments';
import { getUserAuth } from '@/lib/auth/utils';
import { createNotificationAction } from '@/lib/actions/notifications';
import { NotificationType } from '@prisma/client';
import { NOTIFICATION_TITLES } from '@/config/notifications';
import { getUserById } from '@/lib/actions/users';
import { getEventById } from '@/lib/api/events/queries';

export const createComment = async (comment: NewCommentParams) => {
  const { session } = await getUserAuth();
  const newComment = insertCommentSchema.parse({
    ...comment,
    userId: session?.user.id,
  });
  try {
    const c = await db.comment.create({ data: newComment });
    const { event } = await getEventById(c.eventId);
    const eventHostId = await getUserById(event!.userId);
    createNotificationAction({
      userId: eventHostId!.id,
      eventId: comment.eventId,
      type: NotificationType.COMMENT,
      title: NOTIFICATION_TITLES.NEW_COMMENT,
      message: `${session?.user.name ?? 'Someone'} has commented on your event: ${event!.title}`,
    });
    return { comment: c };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const updateComment = async (
  id: CommentId,
  comment: UpdateCommentParams
) => {
  const { session } = await getUserAuth();
  const { id: commentId } = commentIdSchema.parse({ id });
  const newComment = updateCommentSchema.parse({
    ...comment,
    userId: session?.user.id,
  });
  try {
    const c = await db.comment.update({
      where: { id: commentId, userId: session?.user.id },
      data: newComment,
    });
    return { comment: c };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const deleteComment = async (id: CommentId) => {
  const { session } = await getUserAuth();
  const { id: commentId } = commentIdSchema.parse({ id });
  try {
    const c = await db.comment.delete({
      where: { id: commentId, userId: session?.user.id },
    });
    return { comment: c };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};
