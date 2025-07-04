import { notificationSchema } from '@/zodAutoGenSchemas';
import { z } from 'zod';
import { getNotifications } from '@/lib/api/notifications/queries';

// Schema for notifications - used to validate API requests
const baseSchema = notificationSchema.omit({
  createdAt: true,
});

export const insertNotificationSchema = baseSchema.omit({ id: true });
export const insertNotificationParams = baseSchema
  .extend({
    isRead: z.coerce.boolean().optional(),
  })
  .omit({
    id: true,
  });

export const updateNotificationSchema = baseSchema;
export const updateNotificationParams = updateNotificationSchema
  .extend({
    isRead: z.coerce.boolean(),
  })
  .omit({
    userId: true,
  });
export const notificationIdSchema = baseSchema.pick({ id: true });

// Types for notifications - used to type API request params and within Components
export type Notification = z.infer<typeof notificationSchema>;
export type NewNotification = z.infer<typeof insertNotificationSchema>;
export type NewNotificationParams = z.infer<typeof insertNotificationParams>;
export type UpdateNotificationParams = z.infer<typeof updateNotificationParams>;
export type NotificationId = z.infer<typeof notificationIdSchema>['id'];

// this type infers the return from getNotifications() - meaning it will include any joins
export type CompleteNotification = Awaited<
  ReturnType<typeof getNotifications>
>['notifications'][number];
