"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/mentions/useOptimisticMentions";
import { type Mention } from "@/lib/db/schema/mentions";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import MentionForm from "@/components/mentions/MentionForm";
import { type Comment, type CommentId } from "@/lib/db/schema/comments";

export default function OptimisticMention({ 
  mention,
  comments,
  commentId 
}: { 
  mention: Mention; 
  
  comments: Comment[];
  commentId?: CommentId
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Mention) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticMention, setOptimisticMention] = useOptimistic(mention);
  const updateMention: TAddOptimistic = (input) =>
    setOptimisticMention({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <MentionForm
          mention={optimisticMention}
          comments={comments}
        commentId={commentId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateMention}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticMention.mentionedUser}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticMention.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticMention, null, 2)}
      </pre>
    </div>
  );
}
