import * as z from 'zod';
import {
  CompleteRsvp,
  relatedRsvpSchema,
  CompleteComment,
  relatedCommentSchema,
  CompleteNotification,
  relatedNotificationSchema,
} from './index';

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  dateTime: z.date().refine(date => date > new Date(), {
    message: 'Event date must be in the future',
  }),
  location: z.string(),
  maxGuests: z.number().int(),
  imageUrl: z.string().nullish(),
  isPrivate: z.boolean(),
  isCanceled: z.boolean(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface CompleteEvent extends z.infer<typeof eventSchema> {
  rsvps: CompleteRsvp[];
  comments: CompleteComment[];
  Notification: CompleteNotification[];
}

/**
 * relatedEventSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedEventSchema: z.ZodSchema<CompleteEvent> = z.lazy(() =>
  eventSchema.extend({
    rsvps: relatedRsvpSchema.array(),
    comments: relatedCommentSchema.array(),
    Notification: relatedNotificationSchema.array(),
  })
);
