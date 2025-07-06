import { db } from '@/lib/db/index';
import { getUserAuth } from '@/lib/auth/utils';
import { type RsvpId, rsvpIdSchema } from '@/lib/db/schema/rsvps';
import { RsvpStatus } from '@prisma/client';

export const getRsvps = async () => {
  const { session } = await getUserAuth();
  const r = await db.rsvp.findMany({
    where: { userId: session?.user.id },
    include: { event: true, invitee: true },
  });
  return { rsvps: r };
};

export const getRsvpById = async (id: RsvpId) => {
  const { session } = await getUserAuth();
  const { id: rsvpId } = rsvpIdSchema.parse({ id });
  const r = await db.rsvp.findFirst({
    where: { id: rsvpId, userId: session?.user.id },
    include: { event: true, invitee: true },
  });
  return { rsvp: r };
};

export const getUserRsvpForEvent = async (eventId: string) => {
  const { session } = await getUserAuth();
  const r = await db.rsvp.findFirst({
    where: {
      eventId: eventId,
      inviteeId: session?.user.id,
    },
    include: { event: true, invitee: true },
  });
  return { rsvp: r };
};

export const getRsvpCountForEvent = async (eventId: string) => {
  const count = await db.rsvp.count({
    where: { eventId: eventId },
  });
  return { count };
};

export const getRsvpsForEvent = async (eventId: string) => {
  const r = await db.rsvp.findMany({
    where: { eventId: eventId },
    include: { invitee: true },
  });
  return { rsvps: r };
};

export const getEffectiveGuestCountForEvent = async (eventId: string) => {
  const count = await db.rsvp.count({
    where: {
      eventId: eventId,
      status: {
        in: [RsvpStatus.YES, RsvpStatus.MAYBE, RsvpStatus.PENDING],
      },
    },
  });
  return { count };
};

export const getAttendingGuestCountForEvent = async (eventId: string) => {
  const count = await db.rsvp.count({
    where: { eventId: eventId, status: RsvpStatus.YES },
  });
  return { count };
};

export const getEventCapacity = async (eventId: string) => {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { maxGuests: true },
  });

  if (!event) {
    return null;
  }

  const { count: effectiveGuests } =
    await getEffectiveGuestCountForEvent(eventId);
  const availableSpots = event.maxGuests - effectiveGuests;
  const canAddGuests = availableSpots >= 1;

  return {
    effectiveGuests,
    maxGuests: event.maxGuests,
    availableSpots,
    canAddGuests,
  };
};
