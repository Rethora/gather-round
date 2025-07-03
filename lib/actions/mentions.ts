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
