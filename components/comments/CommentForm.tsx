import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/comments/useOptimisticComments";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type Comment, insertCommentParams } from "@/lib/db/schema/comments";
import {
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
} from "@/lib/actions/comments";
import { type Event, type EventId } from "@/lib/db/schema/events";

const CommentForm = ({
  events,
  eventId,
  comment,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  comment?: Comment | null;
  events: Event[];
  eventId?: EventId
  openModal?: (comment?: Comment) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Comment>(insertCommentParams);
  const editing = !!comment?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("comments");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Comment },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`Comment ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const commentParsed = await insertCommentParams.safeParseAsync({ eventId, ...payload });
    if (!commentParsed.success) {
      setErrors(commentParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = commentParsed.data;
    const pendingComment: Comment = {
      updatedAt: comment?.updatedAt ?? new Date(),
      createdAt: comment?.createdAt ?? new Date(),
      id: comment?.id ?? "",
      userId: comment?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingComment,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateCommentAction({ ...values, id: comment.id })
          : await createCommentAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingComment 
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
              <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.content ? "text-destructive" : "",
          )}
        >
          Content
        </Label>
        <Input
          type="text"
          name="content"
          className={cn(errors?.content ? "ring ring-destructive" : "")}
          defaultValue={comment?.content ?? ""}
        />
        {errors?.content ? (
          <p className="text-xs text-destructive mt-2">{errors.content[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {eventId ? null : <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.eventId ? "text-destructive" : "",
          )}
        >
          Event
        </Label>
        <Select defaultValue={comment?.eventId} name="eventId">
          <SelectTrigger
            className={cn(errors?.eventId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a event" />
          </SelectTrigger>
          <SelectContent>
          {events?.map((event) => (
            <SelectItem key={event.id} value={event.id.toString()}>
              {event.id}{/* TODO: Replace with a field from the event model */}
            </SelectItem>
           ))}
          </SelectContent>
        </Select>
        {errors?.eventId ? (
          <p className="text-xs text-destructive mt-2">{errors.eventId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div> }
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: comment });
              const error = await deleteCommentAction(comment.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: comment,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default CommentForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
