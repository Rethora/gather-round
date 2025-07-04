import { mentionSchema } from '@/zodAutoGenSchemas';
import { z } from 'zod';
import { getMentions } from '@/lib/api/mentions/queries';

// Schema for mentions - used to validate API requests
const baseSchema = mentionSchema.omit({
  createdAt: true,
});

export const insertMentionSchema = baseSchema.omit({ id: true });
export const insertMentionParams = baseSchema
  .extend({
    commentId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateMentionSchema = baseSchema;
export const updateMentionParams = updateMentionSchema
  .extend({
    commentId: z.coerce.string().min(1),
  })
  .omit({
    userId: true,
  });
export const mentionIdSchema = baseSchema.pick({ id: true });

// Types for mentions - used to type API request params and within Components
export type Mention = z.infer<typeof mentionSchema>;
export type NewMention = z.infer<typeof insertMentionSchema>;
export type NewMentionParams = z.infer<typeof insertMentionParams>;
export type UpdateMentionParams = z.infer<typeof updateMentionParams>;
export type MentionId = z.infer<typeof mentionIdSchema>['id'];

// this type infers the return from getMentions() - meaning it will include any joins
export type CompleteMention = Awaited<
  ReturnType<typeof getMentions>
>['mentions'][number];
