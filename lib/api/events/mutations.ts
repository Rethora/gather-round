import { db } from '@/lib/db/index';
import {
  EventId,
  NewEventParams,
  UpdateEventParams,
  updateEventSchema,
  insertEventSchema,
  eventIdSchema,
} from '@/lib/db/schema/events';
import { getUserAuth } from '@/lib/auth/utils';

export const createEvent = async (event: NewEventParams) => {
  const { session } = await getUserAuth();
  const newEvent = insertEventSchema.parse({
    ...event,
    userId: session?.user.id,
  });
  try {
    const e = await db.event.create({ data: newEvent });
    return { event: e };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const updateEvent = async (id: EventId, event: UpdateEventParams) => {
  const { session } = await getUserAuth();
  const { id: eventId } = eventIdSchema.parse({ id });
  const newEvent = updateEventSchema.parse({
    ...event,
    userId: session?.user.id,
  });
  try {
    const e = await db.event.update({
      where: { id: eventId, userId: session?.user.id },
      data: newEvent,
    });
    return { event: e };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const deleteEvent = async (id: EventId) => {
  const { session } = await getUserAuth();
  const { id: eventId } = eventIdSchema.parse({ id });
  try {
    const e = await db.event.delete({
      where: { id: eventId, userId: session?.user.id },
    });
    return { event: e };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const cancelEvent = async (id: EventId) => {
  const { session } = await getUserAuth();
  const { id: eventId } = eventIdSchema.parse({ id });
  try {
    const e = await db.event.update({
      where: { id: eventId, userId: session?.user.id },
      data: { isCanceled: true },
    });
    return { event: e };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};
