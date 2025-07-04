'use server';

import { revalidatePath } from 'next/cache';
import {
  createMention,
  deleteMention,
  updateMention,
} from '@/lib/api/mentions/mutations';
import {
  MentionId,
  NewMentionParams,
  UpdateMentionParams,
  mentionIdSchema,
  insertMentionParams,
  updateMentionParams,
} from '@/lib/db/schema/mentions';
import { createNotificationAction } from '@/lib/actions/notifications';
import { getUserById } from '@/lib/actions/users';
import { getCommentById } from '@/lib/api/comments/queries';
import { NOTIFICATION_TITLES } from '@/config/notifications';
import { NotificationType } from '@prisma/client';

const handleErrors = (e: unknown) => {
  const errMsg = 'Error, please try again.';
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === 'object' && 'error' in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateMentions = () => revalidatePath('/mentions');

export const createMentionAction = async (input: NewMentionParams) => {
  try {
    const payload = insertMentionParams.parse(input);
    await createMention(payload);
    const user = await getUserById(payload.mentionedUserId);
    const comment = await getCommentById(payload.commentId);
    createNotificationAction({
      title: NOTIFICATION_TITLES.NEW_MENTION,
      message: `You have been mentioned by ${user!.name} in a comment`,
      type: NotificationType.NEW_MENTION,
      userId: payload.mentionedUserId,
      commentId: payload.commentId,
      eventId: comment!.comment?.eventId,
    });
    revalidateMentions();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateMentionAction = async (input: UpdateMentionParams) => {
  try {
    const payload = updateMentionParams.parse(input);
    await updateMention(payload.id, payload);
    revalidateMentions();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteMentionAction = async (input: MentionId) => {
  try {
    const payload = mentionIdSchema.parse({ id: input });
    await deleteMention(payload.id);
    revalidateMentions();
  } catch (e) {
    return handleErrors(e);
  }
};
