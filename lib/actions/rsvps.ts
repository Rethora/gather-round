'use server';

import { revalidatePath } from 'next/cache';
import {
  createRsvp,
  deleteRsvp,
  updateRsvp,
  createMultipleRsvps,
} from '@/lib/api/rsvps/mutations';
import {
  RsvpId,
  NewRsvpParams,
  UpdateRsvpParams,
  NewMultipleRsvpsParams,
  rsvpIdSchema,
  insertRsvpParams,
  updateRsvpParams,
  insertMultipleRsvpsParams,
} from '@/lib/db/schema/rsvps';
import { createNotificationAction } from './notifications';
import { getEventById } from '../api/events/queries';
import { NotificationType } from '@prisma/client';
import { NOTIFICATION_TITLES } from '@/config/notifications';

const handleErrors = (e: unknown) => {
  const errMsg = 'Error, please try again.';
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === 'object' && 'error' in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateRsvps = () => revalidatePath('/rsvps');

export const createRsvpAction = async (input: NewRsvpParams) => {
  try {
    const payload = insertRsvpParams.parse(input);
    await createRsvp(payload);
    revalidateRsvps();
  } catch (e) {
    return handleErrors(e);
  }
};

export const createMultipleRsvpsAction = async (
  input: NewMultipleRsvpsParams
) => {
  try {
    const payload = insertMultipleRsvpsParams.parse(input);
    const result = await createMultipleRsvps(payload);
    const { event } = await getEventById(payload.eventId);
    result.rsvps.forEach(async rsvp => {
      try {
        console.log('user id', rsvp.inviteeId);
        const notification = await createNotificationAction({
          title: NOTIFICATION_TITLES.NEW_RSVP,
          userId: rsvp.inviteeId,
          eventId: rsvp.eventId,
          message: `You have been invited to ${event?.title ?? 'an event'}`,
          type: NotificationType.NEW_RSVP,
        });
        console.log('Notification created', notification);
      } catch (e) {
        console.error('Error creating notification', e);
      }
    });
    revalidateRsvps();
    return { success: true, count: result.rsvps.length };
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateRsvpAction = async (input: UpdateRsvpParams) => {
  try {
    const payload = updateRsvpParams.parse(input);
    await updateRsvp(payload.id, payload);
    revalidateRsvps();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteRsvpAction = async (input: RsvpId) => {
  try {
    const payload = rsvpIdSchema.parse({ id: input });
    await deleteRsvp(payload.id);
    revalidateRsvps();
  } catch (e) {
    return handleErrors(e);
  }
};
