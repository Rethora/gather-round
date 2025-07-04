import { db } from '@/lib/db/index';

export const getUsersByPartialEmail = async (partialEmail: string) => {
  if (partialEmail.length < 3) return [];
  const foundUsers = await db.user.findMany({
    where: { email: { contains: partialEmail } },
  });
  return foundUsers;
};

export const getUsersByEventId = async ({
  eventId,
  excludeHost = false,
}: {
  eventId: string;
  excludeHost?: boolean;
}) => {
  const rsvps = await db.rsvp.findMany({
    where: { eventId },
    include: { invitee: true, event: true },
  });
  const users = rsvps.map(rsvp => rsvp.invitee);
  if (excludeHost) {
    return users.filter(user => user.id !== rsvps[0].event.userId);
  }
  return users;
};
