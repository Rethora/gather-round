import { rsvpSchema } from '@/zodAutoGenSchemas';
import { z } from 'zod';
import { timestamps } from '@/lib/utils';
import { getRsvps } from '@/lib/api/rsvps/queries';

// Schema for rsvps - used to validate API requests
const baseSchema = rsvpSchema.omit(timestamps);

export const insertRsvpSchema = baseSchema.omit({ id: true });
export const insertRsvpParams = baseSchema
  .extend({
    eventId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateRsvpSchema = baseSchema;
export const updateRsvpParams = updateRsvpSchema
  .extend({
    eventId: z.coerce.string().min(1),
  })
  .omit({
    userId: true,
  });
export const rsvpIdSchema = baseSchema.pick({ id: true });

// Types for rsvps - used to type API request params and within Components
export type Rsvp = z.infer<typeof rsvpSchema>;
export type NewRsvp = z.infer<typeof insertRsvpSchema>;
export type NewRsvpParams = z.infer<typeof insertRsvpParams>;
export type UpdateRsvpParams = z.infer<typeof updateRsvpParams>;
export type RsvpId = z.infer<typeof rsvpIdSchema>['id'];

// this type infers the return from getRsvps() - meaning it will include any joins
export type CompleteRsvp = Awaited<
  ReturnType<typeof getRsvps>
>['rsvps'][number];
