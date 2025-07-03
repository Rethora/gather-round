import * as z from "zod"
import { CompleteComment, relatedCommentSchema } from "./index"

export const mentionSchema = z.object({
  id: z.string(),
  mentionedUserId: z.string(),
  commentId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
})

export interface CompleteMention extends z.infer<typeof mentionSchema> {
  comment: CompleteComment
}

/**
 * relatedMentionSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedMentionSchema: z.ZodSchema<CompleteMention> = z.lazy(() => mentionSchema.extend({
  comment: relatedCommentSchema,
}))
