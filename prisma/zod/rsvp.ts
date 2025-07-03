import * as z from "zod"
import { RsvpStatus } from "@prisma/client"
import { CompleteEvent, relatedEventSchema, CompleteUser, relatedUserSchema } from "./index"

export const rsvpSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(RsvpStatus),
  eventId: z.string(),
  userId: z.string(),
  inviteeId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteRsvp extends z.infer<typeof rsvpSchema> {
  event: CompleteEvent
  invitee: CompleteUser
}

/**
 * relatedRsvpSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedRsvpSchema: z.ZodSchema<CompleteRsvp> = z.lazy(() => rsvpSchema.extend({
  event: relatedEventSchema,
  invitee: relatedUserSchema,
}))
