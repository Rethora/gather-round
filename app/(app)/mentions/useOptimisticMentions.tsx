import { type Comment } from "@/lib/db/schema/comments";
import { type Mention, type CompleteMention } from "@/lib/db/schema/mentions";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Mention>) => void;

export const useOptimisticMentions = (
  mentions: CompleteMention[],
  comments: Comment[]
) => {
  const [optimisticMentions, addOptimisticMention] = useOptimistic(
    mentions,
    (
      currentState: CompleteMention[],
      action: OptimisticAction<Mention>,
    ): CompleteMention[] => {
      const { data } = action;

      const optimisticComment = comments.find(
        (comment) => comment.id === data.commentId,
      )!;

      const optimisticMention = {
        ...data,
        comment: optimisticComment,
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticMention]
            : [...currentState, optimisticMention];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticMention } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: "delete" } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticMention, optimisticMentions };
};
