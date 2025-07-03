"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Mention, CompleteMention } from "@/lib/db/schema/mentions";
import Modal from "@/components/shared/Modal";
import { type Comment, type CommentId } from "@/lib/db/schema/comments";
import { useOptimisticMentions } from "@/app/(app)/mentions/useOptimisticMentions";
import { Button } from "@/components/ui/button";
import MentionForm from "./MentionForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (mention?: Mention) => void;

export default function MentionList({
  mentions,
  comments,
  commentId 
}: {
  mentions: CompleteMention[];
  comments: Comment[];
  commentId?: CommentId 
}) {
  const { optimisticMentions, addOptimisticMention } = useOptimisticMentions(
    mentions,
    comments 
  );
  const [open, setOpen] = useState(false);
  const [activeMention, setActiveMention] = useState<Mention | null>(null);
  const openModal = (mention?: Mention) => {
    setOpen(true);
    mention ? setActiveMention(mention) : setActiveMention(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeMention ? "Edit Mention" : "Create Mention"}
      >
        <MentionForm
          mention={activeMention}
          addOptimistic={addOptimisticMention}
          openModal={openModal}
          closeModal={closeModal}
          comments={comments}
        commentId={commentId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticMentions.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticMentions.map((mention) => (
            <Mention
              mention={mention}
              key={mention.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Mention = ({
  mention,
  openModal,
}: {
  mention: CompleteMention;
  openModal: TOpenModal;
}) => {
  const optimistic = mention.id === "optimistic";
  const deleting = mention.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("mentions")
    ? pathname
    : pathname + "/mentions/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{mention.mentionedUser}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + mention.id }>
          Edit
        </Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No mentions
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new mention.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Mentions </Button>
      </div>
    </div>
  );
};
