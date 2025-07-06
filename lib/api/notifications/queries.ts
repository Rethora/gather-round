import { db } from '@/lib/db/index';
import { getUserAuth } from '@/lib/auth/utils';
import {
  type NotificationId,
  notificationIdSchema,
} from '@/lib/db/schema/notifications';
import { NotificationType, Prisma } from '@prisma/client';

export interface GetNotificationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'all' | 'read' | 'unread';
  type?: NotificationType | 'all';
}

export const getNotifications = async ({
  page = 1,
  pageSize = 10,
  search = '',
  status = 'all',
  type = 'EVENT_UPDATE',
}: GetNotificationsParams = {}) => {
  const { session } = await getUserAuth();
  if (!session?.user.id) return { notifications: [], total: 0 };

  const where: Prisma.NotificationWhereInput = { userId: session.user.id };

  if (status !== 'all') {
    where.isRead = status === 'read';
  }
  if (type !== 'all') {
    where.type = type;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ];
  }

  const total = await db.notification.count({ where });
  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  return { notifications, total };
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
