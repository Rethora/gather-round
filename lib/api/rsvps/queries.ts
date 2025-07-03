import { db } from '@/lib/db/index';
import { getUserAuth } from '@/lib/auth/utils';
import { type RsvpId, rsvpIdSchema } from '@/lib/db/schema/rsvps';

export const getRsvps = async () => {
  const { session } = await getUserAuth();
  const r = await db.rsvp.findMany({
    where: { userId: session?.user.id },
    include: { event: true },
  });
  return { rsvps: r };
};

export const getRsvpById = async (id: RsvpId) => {
  const { session } = await getUserAuth();
  const { id: rsvpId } = rsvpIdSchema.parse({ id });
  const r = await db.rsvp.findFirst({
    where: { id: rsvpId, userId: session?.user.id },
    include: { event: true },
  });
  return { rsvp: r };
};
