import { db } from '@/lib/db/index';
import { getUserAuth } from '@/lib/auth/utils';
import { type MentionId, mentionIdSchema } from '@/lib/db/schema/mentions';

export const getMentions = async () => {
  const { session } = await getUserAuth();
  const m = await db.mention.findMany({
    where: { userId: session?.user.id },
    include: { comment: true },
  });
  return { mentions: m };
};

export const getMentionById = async (id: MentionId) => {
  const { session } = await getUserAuth();
  const { id: mentionId } = mentionIdSchema.parse({ id });
  const m = await db.mention.findFirst({
    where: { id: mentionId, userId: session?.user.id },
    include: { comment: true },
  });
  return { mention: m };
};
