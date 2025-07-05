import { db } from '@/lib/db/index';
import { getUserAuth } from '@/lib/auth/utils';
import {
  type NotificationId,
  notificationIdSchema,
} from '@/lib/db/schema/notifications';

export const getNotifications = async () => {
  const { session } = await getUserAuth();
  const n = await db.notification.findMany({
    where: { userId: session?.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return { notifications: n };
};

export const getNotificationById = async (id: NotificationId) => {
  const { session } = await getUserAuth();
  const { id: notificationId } = notificationIdSchema.parse({ id });
  const n = await db.notification.findFirst({
    where: { id: notificationId, userId: session?.user.id },
  });
  if (!n) {
    throw { error: 'Notification not found' };
  }
  const updatedNotification = await db.notification.update({
    where: { id: notificationId, userId: session?.user.id },
    data: { isRead: true },
  });
  return { notification: updatedNotification };
};
