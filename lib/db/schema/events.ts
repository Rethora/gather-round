import { eventSchema } from "@/zodAutoGenSchemas";
import { z } from "zod";
import { timestamps } from "@/lib/utils";
import { getEvents } from "@/lib/api/events/queries";


// Schema for events - used to validate API requests
const baseSchema = eventSchema.omit(timestamps)

export const insertEventSchema = baseSchema.omit({ id: true });
export const insertEventParams = baseSchema.extend({
  dateTime: z.coerce.date(),
  maxGuests: z.coerce.number(),
  isPrivate: z.coerce.boolean(),
  isCanceled: z.coerce.boolean()
}).omit({ 
  id: true,
  userId: true
});

export const updateEventSchema = baseSchema;
export const updateEventParams = updateEventSchema.extend({
  dateTime: z.coerce.date(),
  maxGuests: z.coerce.number(),
  isPrivate: z.coerce.boolean(),
  isCanceled: z.coerce.boolean()
}).omit({ 
  userId: true
});
export const eventIdSchema = baseSchema.pick({ id: true });

// Types for events - used to type API request params and within Components
export type Event = z.infer<typeof eventSchema>;
export type NewEvent = z.infer<typeof insertEventSchema>;
export type NewEventParams = z.infer<typeof insertEventParams>;
export type UpdateEventParams = z.infer<typeof updateEventParams>;
export type EventId = z.infer<typeof eventIdSchema>["id"];
    
// this type infers the return from getEvents() - meaning it will include any joins
export type CompleteEvent = Awaited<ReturnType<typeof getEvents>>["events"][number];

