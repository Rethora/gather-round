import { db } from '@/lib/db/index';
import { getUserAuth } from '@/lib/auth/utils';
import { type EventId, eventIdSchema } from '@/lib/db/schema/events';

export const getEvents = async () => {
  const { session } = await getUserAuth();
  const e = await db.event.findMany({
    where: {
      OR: [
        { userId: session?.user.id },
        { rsvps: { some: { inviteeId: session?.user.id } } },
      ],
    },
    include: {
      rsvps: { include: { invitee: true } },
    },
    orderBy: {
      dateTime: 'asc',
    },
  });
  return { events: e };
};

export const getEventById = async (id: EventId) => {
  const { session } = await getUserAuth();
  const { id: eventId } = eventIdSchema.parse({ id });
  const e = await db.event.findFirst({
    where: {
      id: eventId,
      OR: [
        { userId: session?.user.id },
        { rsvps: { some: { inviteeId: session?.user.id } } },
      ],
    },
  });
  return { event: e };
};

export const getEventByIdWithRsvpsWithUsersAndComments = async (
  id: EventId
) => {
  const { session } = await getUserAuth();
  const { id: eventId } = eventIdSchema.parse({ id });
  const e = await db.event.findFirst({
    where: {
      id: eventId,
      OR: [
        { userId: session?.user.id },
        { rsvps: { some: { inviteeId: session?.user.id } } },
      ],
    },
    include: {
      rsvps: { include: { event: true, invitee: true } },
      comments: { include: { event: true } },
    },
  });
  if (e === null) return { event: null };
  const { rsvps, comments, ...event } = e;

  return { event, rsvps: rsvps, comments: comments };
};
