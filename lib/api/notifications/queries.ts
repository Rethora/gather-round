import { db } from "@/lib/db/index";
import { getUserAuth } from "@/lib/auth/utils";
import { type NotificationId, notificationIdSchema } from "@/lib/db/schema/notifications";

export const getNotifications = async () => {
  const { session } = await getUserAuth();
  const n = await db.notification.findMany({ where: {userId: session?.user.id!}});
  return { notifications: n };
};

export const getNotificationById = async (id: NotificationId) => {
  const { session } = await getUserAuth();
  const { id: notificationId } = notificationIdSchema.parse({ id });
  const n = await db.notification.findFirst({
    where: { id: notificationId, userId: session?.user.id!}});
  return { notification: n };
};


