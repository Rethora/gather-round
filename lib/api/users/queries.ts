import { db } from '@/lib/db/index';

export const getUsersByPartialEmail = async (partialEmail: string) => {
  if (partialEmail.length < 3) return [];
  const foundUsers = await db.user.findMany({
    where: { email: { contains: partialEmail } },
  });
  return foundUsers;
};

export const getUsersByEmails = async (emails: string[]) => {
  const users = await db.user.findMany({
    where: { email: { in: emails } },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  return users;
};

export const getUserByEmail = async (email: string) => {
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  return user;
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
    include: {
      invitee: true,
      event: { select: { userId: true } },
    },
  });

  const users = rsvps.map(rsvp => {
    const { hashedPassword: _, ...userWithoutPassword } = rsvp.invitee;
    return userWithoutPassword;
  });

  if (excludeHost) {
    const hostId = rsvps[0]?.event.userId;
    return users.filter(user => user.id !== hostId);
  }

  return users;
};
