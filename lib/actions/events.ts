'use server';

import { revalidatePath } from 'next/cache';
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from '@/lib/api/events/mutations';
import {
  EventId,
  NewEventParams,
  UpdateEventParams,
  eventIdSchema,
  insertEventParams,
  updateEventParams,
} from '@/lib/db/schema/events';
import { getUsersByEventId } from '@/lib/api/users/queries';
import { NotificationType } from '@prisma/client';
import { createNotificationAction } from './notifications';
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

const revalidateEvents = () => revalidatePath('/events');

export const createEventAction = async (input: NewEventParams) => {
  try {
    const payload = insertEventParams.parse(input);
    await createEvent(payload);
    revalidateEvents();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateEventAction = async (input: UpdateEventParams) => {
  try {
    const payload = updateEventParams.parse(input);
    const users = await getUsersByEventId({
      eventId: payload.id,
      excludeHost: true,
    });
    await updateEvent(payload.id, payload);
    const { isCanceled } = payload;
    // * If event is canceled, send notification to all users
    if (isCanceled) {
      users.forEach(user => {
        createNotificationAction({
          userId: user.id,
          eventId: payload.id,
          type: NotificationType.EVENT_CANCELLED,
          title: NOTIFICATION_TITLES.EVENT_CANCELLED,
          message: `The event ${payload.title} has been cancelled`,
        });
      });
    } else {
      // * If event is updated, send notification to all users
      users.forEach(user => {
        createNotificationAction({
          userId: user.id,
          eventId: payload.id,
          type: NotificationType.EVENT_UPDATE,
          title: NOTIFICATION_TITLES.EVENT_UPDATE,
          message: `The event ${payload.title} has been updated`,
        });
      });
    }
    revalidateEvents();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteEventAction = async (input: EventId) => {
  try {
    const payload = eventIdSchema.parse({ id: input });
    await deleteEvent(payload.id);
    revalidateEvents();
  } catch (e) {
    return handleErrors(e);
  }
};
