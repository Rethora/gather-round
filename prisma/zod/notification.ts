import * as z from 'zod';
import { NotificationType } from '@prisma/client';
import {
  CompleteEvent,
  relatedEventSchema,
  CompleteComment,
  relatedCommentSchema,
} from './index';

export const notificationSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(NotificationType),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  eventId: z.string().nullish(),
  commentId: z.string().nullish(),
  userId: z.string(),
  createdAt: z.date(),
});

export interface CompleteNotification
  extends z.infer<typeof notificationSchema> {
  event?: CompleteEvent | null;
  comment?: CompleteComment | null;
}

/**
 * relatedNotificationSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedNotificationSchema: z.ZodSchema<CompleteNotification> =
  z.lazy(() =>
    notificationSchema.extend({
      event: relatedEventSchema.nullish(),
      comment: relatedCommentSchema.nullish(),
    })
  );
