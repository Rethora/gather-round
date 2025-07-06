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
    // Check event capacity before creating RSVP
    const event = await db.event.findUnique({
      where: { id: rsvp.eventId },
    });
    if (!event) {
      throw { error: 'Event not found' };
    }

    const effectiveGuestCount = await db.rsvp.count({
      where: {
        eventId: rsvp.eventId,
        status: {
          in: [RsvpStatus.YES, RsvpStatus.MAYBE, RsvpStatus.PENDING],
        },
      },
    });

    if (effectiveGuestCount >= event.maxGuests) {
      throw {
        error: `Cannot add guest. Event capacity is ${event.maxGuests} and currently has ${effectiveGuestCount} reserved spots.`,
      };
    }

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
    const event = await db.event.findUnique({
      where: { id: input.eventId },
    });
    if (!event) {
      throw { error: 'Event not found' };
    }
    if (!event.isPrivate) {
      throw { error: 'Cannot invite to public event' };
    }

    // Check current effective guest count (including PENDING)
    const effectiveGuestCount = await db.rsvp.count({
      where: {
        eventId: input.eventId,
        status: {
          in: [RsvpStatus.YES, RsvpStatus.MAYBE, RsvpStatus.PENDING],
        },
      },
    });

    // Calculate how many new RSVPs will be created (excluding self-invites)
    const newRsvpCount = input.inviteeIds.filter(
      id => id !== session.user.id
    ).length;
    const totalEffectiveGuestsAfterCreation =
      effectiveGuestCount + newRsvpCount;

    if (totalEffectiveGuestsAfterCreation > event.maxGuests) {
      throw {
        error: `Cannot add ${newRsvpCount} guest(s). Event capacity is ${event.maxGuests} and currently has ${effectiveGuestCount} reserved spots.`,
      };
    }

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
    // Get the current RSVP to check if status is changing
    const currentRsvp = await db.rsvp.findUnique({
      where: { id: rsvpId },
    });

    if (!currentRsvp) {
      throw { error: 'RSVP not found' };
    }

    // Only check capacity when changing from NO to other statuses (since NO doesn't reserve a spot)
    if (
      newRsvp.status &&
      currentRsvp.status === RsvpStatus.NO &&
      (newRsvp.status === RsvpStatus.YES ||
        newRsvp.status === RsvpStatus.MAYBE ||
        newRsvp.status === RsvpStatus.PENDING)
    ) {
      const event = await db.event.findUnique({
        where: { id: currentRsvp.eventId },
      });

      if (!event) {
        throw { error: 'Event not found' };
      }

      // Count effective guests (excluding the current RSVP if it's NO)
      const effectiveGuestCount = await db.rsvp.count({
        where: {
          eventId: currentRsvp.eventId,
          status: {
            in: [RsvpStatus.YES, RsvpStatus.MAYBE, RsvpStatus.PENDING],
          },
          id: {
            not: rsvpId, // Exclude current RSVP from count
          },
        },
      });

      if (effectiveGuestCount >= event.maxGuests) {
        throw {
          error: `Cannot change status to ${newRsvp.status}. Event capacity is ${event.maxGuests} and currently has ${effectiveGuestCount} reserved spots.`,
        };
      }
    }

    const r = await db.rsvp.update({
      where: { id: rsvpId, inviteeId: session?.user.id },
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
