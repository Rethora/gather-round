'use server';

import { revalidatePath } from 'next/cache';
import {
  createComment,
  deleteComment,
  updateComment,
} from '@/lib/api/comments/mutations';
import {
  CommentId,
  NewCommentParams,
  UpdateCommentParams,
  commentIdSchema,
  insertCommentParams,
  updateCommentParams,
} from '@/lib/db/schema/comments';
import { createMentionAction } from '@/lib/actions/mentions';
import { getUsersByEmails, getUsersByEventId } from '@/lib/api/users/queries';
import { getUserAuth } from '@/lib/auth/utils';
import { NotificationType } from '@prisma/client';
import { createNotificationAction } from './notifications';
import { NOTIFICATION_TITLES } from '@/config/notifications';
import { getUserById } from './users';
import { getEventById } from '../api/events/queries';

const handleErrors = (e: unknown) => {
  const errMsg = 'Error, please try again.';
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === 'object' && 'error' in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateComments = () => revalidatePath('/comments');

export const createCommentAction = async (
  input: NewCommentParams,
  mentions: string[]
) => {
  const { session } = await getUserAuth();
  try {
    const payload = insertCommentParams.parse(input);
    const { comment } = await createComment(payload);
    const { event } = await getEventById(comment.eventId);
    const eventHostId = await getUserById(event!.userId);
    createNotificationAction({
      userId: eventHostId!.id,
      eventId: comment.eventId,
      type: NotificationType.COMMENT,
      title: NOTIFICATION_TITLES.NEW_COMMENT,
      message: `${session?.user.name ?? 'Someone'} has commented on your event: ${event!.title}`,
    });
    const mentionedUsers = await getUsersByEmails(mentions);
    const eventUsers = await getUsersByEventId({
      eventId: comment.eventId,
    });
    const usersToMention = mentionedUsers.filter(
      user =>
        !eventUsers.some(eventUser => eventUser.id === user.id) &&
        user.id !== session?.user.id
    );

    usersToMention.forEach(async user => {
      await createMentionAction({
        commentId: comment.id,
        mentionedUserId: user.id,
      });
    });
    revalidateComments();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateCommentAction = async (input: UpdateCommentParams) => {
  try {
    const payload = updateCommentParams.parse(input);
    await updateComment(payload.id, payload);
    revalidateComments();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteCommentAction = async (input: CommentId) => {
  try {
    const payload = commentIdSchema.parse({ id: input });
    await deleteComment(payload.id);
    revalidateComments();
  } catch (e) {
    return handleErrors(e);
  }
};
