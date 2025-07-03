import { db } from '@/lib/db/index';
import {
  RsvpId,
  NewRsvpParams,
  UpdateRsvpParams,
  NewMultipleRsvpsParams,
  updateRsvpSchema,
  insertRsvpSchema,
  rsvpIdSchema,
} from '@/lib/db/schema/rsvps';
import { getUserAuth } from '@/lib/auth/utils';
import { RsvpStatus } from '@prisma/client';

export const createRsvp = async (rsvp: NewRsvpParams) => {
  const { session } = await getUserAuth();
  const newRsvp = insertRsvpSchema.parse({
    ...rsvp,
    userId: session?.user.id,
  });
  try {
    const r = await db.rsvp.create({ data: newRsvp });
    return { rsvp: r };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const createMultipleRsvps = async (input: NewMultipleRsvpsParams) => {
  const { session } = await getUserAuth();
  if (!session?.user.id) {
    throw { error: 'User not authenticated' };
  }

  try {
    // Use a transaction to create all RSVPs atomically
    const result = await db.$transaction(async tx => {
      const rsvps = [];

      for (const inviteeId of input.inviteeIds) {
        // Skip if the user is trying to invite themselves
        if (inviteeId === session.user.id) {
          continue;
        }

        const newRsvp = insertRsvpSchema.parse({
          eventId: input.eventId,
          inviteeId: inviteeId,
          userId: session.user.id,
          status: RsvpStatus.PENDING,
        });

        const rsvp = await tx.rsvp.create({ data: newRsvp });
        rsvps.push(rsvp);
      }

      return { rsvps };
    });

    return result;
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const updateRsvp = async (id: RsvpId, rsvp: UpdateRsvpParams) => {
  const { session } = await getUserAuth();
  const { id: rsvpId } = rsvpIdSchema.parse({ id });
  const newRsvp = updateRsvpSchema.parse({
    ...rsvp,
    userId: session?.user.id,
  });
  try {
    const r = await db.rsvp.update({
      where: { id: rsvpId, userId: session?.user.id },
      data: newRsvp,
    });
    return { rsvp: r };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const deleteRsvp = async (id: RsvpId) => {
  const { session } = await getUserAuth();
  const { id: rsvpId } = rsvpIdSchema.parse({ id });
  try {
    const r = await db.rsvp.delete({
      where: { id: rsvpId, userId: session?.user.id },
    });
    return { rsvp: r };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};
