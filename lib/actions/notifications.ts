'use server';

import { revalidatePath } from 'next/cache';
import {
  createNotification,
  deleteNotification,
  updateNotification,
} from '@/lib/api/notifications/mutations';
import {
  NotificationId,
  NewNotificationParams,
  UpdateNotificationParams,
  notificationIdSchema,
  insertNotificationParams,
  updateNotificationParams,
} from '@/lib/db/schema/notifications';
import { db } from '@/lib/db/index';
import { getUserAuth } from '@/lib/auth/utils';

const handleErrors = (e: unknown) => {
  const errMsg = 'Error, please try again.';
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === 'object' && 'error' in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateNotifications = () => revalidatePath('/notifications');

export const createNotificationAction = async (
  input: NewNotificationParams
) => {
  try {
    const payload = insertNotificationParams.parse(input);
    await createNotification(payload);
    revalidateNotifications();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateNotificationAction = async (
  input: UpdateNotificationParams
) => {
  try {
    const payload = updateNotificationParams.parse(input);
    await updateNotification(payload.id, payload);
    revalidateNotifications();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteNotificationAction = async (input: NotificationId) => {
  try {
    const payload = notificationIdSchema.parse({ id: input });
    await deleteNotification(payload.id);
    revalidateNotifications();
  } catch (e) {
    return handleErrors(e);
  }
};

export async function markNotificationsAsReadAction(notificationIds: string[]) {
  const { session } = await getUserAuth();
  if (!session?.user.id) {
    throw new Error('Unauthorized');
  }

  await db.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId: session.user.id,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath('/notifications');
  return { success: true };
}
