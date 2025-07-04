import { db } from '@/lib/db/index';
import {
  NotificationId,
  NewNotificationParams,
  UpdateNotificationParams,
  updateNotificationSchema,
  insertNotificationSchema,
  notificationIdSchema,
} from '@/lib/db/schema/notifications';
import { getUserAuth } from '@/lib/auth/utils';

export const createNotification = async (
  notification: NewNotificationParams
) => {
  const newNotification = insertNotificationSchema.parse({
    ...notification,
    isRead: false,
  });
  try {
    const n = await db.notification.create({ data: newNotification });
    return { notification: n };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const updateNotification = async (
  id: NotificationId,
  notification: UpdateNotificationParams
) => {
  const { session } = await getUserAuth();
  const { id: notificationId } = notificationIdSchema.parse({ id });
  const newNotification = updateNotificationSchema.parse({
    ...notification,
    userId: session?.user.id,
  });
  try {
    const n = await db.notification.update({
      where: { id: notificationId, userId: session?.user.id },
      data: newNotification,
    });
    return { notification: n };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const deleteNotification = async (id: NotificationId) => {
  const { session } = await getUserAuth();
  const { id: notificationId } = notificationIdSchema.parse({ id });
  try {
    const n = await db.notification.delete({
      where: { id: notificationId, userId: session?.user.id },
    });
    return { notification: n };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};
