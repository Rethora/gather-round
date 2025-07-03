import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/(app)/rsvps/useOptimisticRsvps';

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

import { type Rsvp, insertRsvpParams } from '@/lib/db/schema/rsvps';
import {
  createRsvpAction,
  deleteRsvpAction,
  updateRsvpAction,
} from '@/lib/actions/rsvps';
import { type Event, type EventId } from '@/lib/db/schema/events';

const RsvpForm = ({
  events,
  eventId,
  rsvp,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  rsvp?: Rsvp | null;
  events: Event[];
  eventId?: EventId;
  openModal?: (rsvp?: Rsvp) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Rsvp>(insertRsvpParams);
  const editing = !!rsvp?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath('rsvps');

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Rsvp }
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
      toast.success(`Rsvp ${action}d!`);
      if (action === 'delete') router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const rsvpParsed = await insertRsvpParams.safeParseAsync({
      eventId,
      ...payload,
    });
    if (!rsvpParsed.success) {
      setErrors(rsvpParsed?.error.flatten().fieldErrors);
      return;
    }

    if (closeModal) closeModal();
    const values = rsvpParsed.data;
    const pendingRsvp: Rsvp = {
      updatedAt: rsvp?.updatedAt ?? new Date(),
      createdAt: rsvp?.createdAt ?? new Date(),
      id: rsvp?.id ?? '',
      userId: rsvp?.userId ?? '',
      ...values,
    };
    try {
      startMutation(async () => {
        if (addOptimistic)
          addOptimistic({
            data: pendingRsvp,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updateRsvpAction({ ...values, id: rsvp.id })
          : await createRsvpAction(values);

        const errorFormatted = {
          error: error ?? 'Error',
          values: pendingRsvp,
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
            errors?.inviteeId ? 'text-destructive' : ''
          )}
        >
          Invitee
        </Label>
        <Input
          type="text"
          name="inviteeId"
          className={cn(errors?.inviteeId ? 'ring ring-destructive' : '')}
          defaultValue={rsvp?.inviteeId ?? ''}
        />
        {errors?.inviteeId ? (
          <p className="text-xs text-destructive mt-2">{errors.inviteeId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {eventId ? null : (
        <div>
          <Label
            className={cn(
              'mb-2 inline-block',
              errors?.eventId ? 'text-destructive' : ''
            )}
          >
            Event
          </Label>
          <Select defaultValue={rsvp?.eventId} name="eventId">
            <SelectTrigger
              className={cn(errors?.eventId ? 'ring ring-destructive' : '')}
            >
              <SelectValue placeholder="Select a event" />
            </SelectTrigger>
            <SelectContent>
              {events?.map(event => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.id}
                  {/* TODO: Replace with a field from the event model */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.eventId ? (
            <p className="text-xs text-destructive mt-2">{errors.eventId[0]}</p>
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
                addOptimistic({ action: 'delete', data: rsvp });
              const error = await deleteRsvpAction(rsvp.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? 'Error',
                values: rsvp,
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

export default RsvpForm;

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
