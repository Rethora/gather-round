import * as z from 'zod';
import {
  CompleteEvent,
  relatedEventSchema,
  CompleteMention,
  relatedMentionSchema,
  CompleteNotification,
  relatedNotificationSchema,
} from './index';

export const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  eventId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface CompleteComment extends z.infer<typeof commentSchema> {
  event: CompleteEvent;
  mentions: CompleteMention[];
  Notification: CompleteNotification[];
}

/**
 * relatedCommentSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedCommentSchema: z.ZodSchema<CompleteComment> = z.lazy(() =>
  commentSchema.extend({
    event: relatedEventSchema,
    mentions: relatedMentionSchema.array(),
    Notification: relatedNotificationSchema.array(),
  })
);
