import { db } from '@/lib/db/index';
import {
  MentionId,
  NewMentionParams,
  UpdateMentionParams,
  updateMentionSchema,
  insertMentionSchema,
  mentionIdSchema,
} from '@/lib/db/schema/mentions';
import { getUserAuth } from '@/lib/auth/utils';

export const createMention = async (mention: NewMentionParams) => {
  const { session } = await getUserAuth();
  const newMention = insertMentionSchema.parse({
    ...mention,
    userId: session?.user.id,
  });
  try {
    const m = await db.mention.create({ data: newMention });
    return { mention: m };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const updateMention = async (
  id: MentionId,
  mention: UpdateMentionParams
) => {
  const { session } = await getUserAuth();
  const { id: mentionId } = mentionIdSchema.parse({ id });
  const newMention = updateMentionSchema.parse({
    ...mention,
    userId: session?.user.id,
  });
  try {
    const m = await db.mention.update({
      where: { id: mentionId, userId: session?.user.id },
      data: newMention,
    });
    return { mention: m };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const deleteMention = async (id: MentionId) => {
  const { session } = await getUserAuth();
  const { id: mentionId } = mentionIdSchema.parse({ id });
  try {
    const m = await db.mention.delete({
      where: { id: mentionId, userId: session?.user.id },
    });
    return { mention: m };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};
