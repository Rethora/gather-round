import * as z from 'zod';
import {
  CompleteSession,
  relatedSessionSchema,
  CompleteRsvp,
  relatedRsvpSchema,
} from './index';

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  hashedPassword: z.string(),
  name: z.string().nullish(),
});

export interface CompleteUser extends z.infer<typeof userSchema> {
  sessions: CompleteSession[];
  Rsvp: CompleteRsvp[];
}

/**
 * relatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() =>
  userSchema.extend({
    sessions: relatedSessionSchema.array(),
    Rsvp: relatedRsvpSchema.array(),
  })
);
