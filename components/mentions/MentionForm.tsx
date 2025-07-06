import { z } from 'zod';

import { useState, useTransition, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/(app)/mentions/useOptimisticMentions';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBackPath } from '@/components/shared/BackButton';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { type Mention, insertMentionParams } from '@/lib/db/schema/mentions';
import {
  createMentionAction,
  deleteMentionAction,
  updateMentionAction,
} from '@/lib/actions/mentions';
import { type Comment, type CommentId } from '@/lib/db/schema/comments';
import { usePollingContext } from '@/lib/hooks/usePollingContext';

const MentionForm = ({
  comments,
  commentId,
  mention,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  mention?: Mention | null;
  comments: Comment[];
  commentId?: CommentId;
  openModal?: (mention?: Mention) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Mention>(insertMentionParams);
  const editing = !!mention?.id;
  const { pausePolling, resumePolling } = usePollingContext();

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  // Pause polling when form is being used
  useEffect(() => {
    pausePolling();
    return () => {
      resumePolling();
    };
  }, [pausePolling, resumePolling]);

  const router = useRouter();
  const backpath = useBackPath('mentions');

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Mention }
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      if (openModal) openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? 'Error',
      });
    } else {
      router.refresh();
      if (postSuccess) postSuccess();
      toast.success(`Mention ${action}d!`);
      if (action === 'delete') router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    console.log('payload', payload);
    const mentionParsed = await insertMentionParams.safeParseAsync({
      commentId,
      ...payload,
    });
    if (!mentionParsed.success) {
      setErrors(mentionParsed?.error.flatten().fieldErrors);
      return;
    }

    if (closeModal) closeModal();
    const values = mentionParsed.data;
    const pendingMention: Mention = {
      createdAt: mention?.createdAt ?? new Date(),
      id: mention?.id ?? '',
      userId: mention?.userId ?? '',
      ...values,
    };
    try {
      startMutation(async () => {
        if (addOptimistic)
          addOptimistic({
            data: pendingMention,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updateMentionAction({ ...values, id: mention.id })
          : await createMentionAction(values);

        const errorFormatted = {
          error: error ?? 'Error',
          values: pendingMention,
        };
        onSuccess(
          editing ? 'update' : 'create',
          error ? errorFormatted : undefined
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={'space-y-8'}>
      {/* Schema fields start */}
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.mentionedUserId ? 'text-destructive' : ''
          )}
        >
          Mentioned User
        </Label>
        <Input
          type="text"
          name="mentionedUserId"
          className={cn(errors?.mentionedUserId ? 'ring ring-destructive' : '')}
          defaultValue={mention?.mentionedUserId ?? ''}
        />
        {errors?.mentionedUserId ? (
          <p className="text-xs text-destructive mt-2">
            {errors.mentionedUserId[0]}
          </p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {commentId ? null : (
        <div>
          <Label
            className={cn(
              'mb-2 inline-block',
              errors?.commentId ? 'text-destructive' : ''
            )}
          >
            Comment
          </Label>
          <Select defaultValue={mention?.commentId} name="commentId">
            <SelectTrigger
              className={cn(errors?.commentId ? 'ring ring-destructive' : '')}
            >
              <SelectValue placeholder="Select a comment" />
            </SelectTrigger>
            <SelectContent>
              {comments?.map(comment => (
                <SelectItem key={comment.id} value={comment.id.toString()}>
                  {comment.id}
                  {/* TODO: Replace with a field from the comment model */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.commentId ? (
            <p className="text-xs text-destructive mt-2">
              {errors.commentId[0]}
            </p>
          ) : (
            <div className="h-6" />
          )}
        </div>
      )}
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={'destructive'}
          onClick={() => {
            setIsDeleting(true);
            if (closeModal) closeModal();
            startMutation(async () => {
              if (addOptimistic)
                addOptimistic({ action: 'delete', data: mention });
              const error = await deleteMentionAction(mention.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? 'Error',
                values: mention,
              };

              onSuccess('delete', error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? 'ing...' : 'e'}
        </Button>
      ) : null}
    </form>
  );
};

export default MentionForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: boolean;
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
        ? `Sav${isUpdating ? 'ing...' : 'e'}`
        : `Creat${isCreating ? 'ing...' : 'e'}`}
    </Button>
  );
};
