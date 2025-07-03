import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/(app)/rsvps/useOptimisticRsvps';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBackPath } from '@/components/shared/BackButton';
import { useDebouncedCallback } from 'use-debounce';

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
  createMultipleRsvpsAction,
} from '@/lib/actions/rsvps';
import { type Event, type EventId } from '@/lib/db/schema/events';
import { lookupUsersByPartialEmail } from '@/lib/actions/users';
import { ComboBox } from '@/components/ui/combo-box';

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

  // Multi-select ComboBox state
  const [selectedUsers, setSelectedUsers] = useState<
    { value: string; label: string }[]
  >([]);
  const [userOptions, setUserOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Debounced DB query for user lookup
  const debouncedLookup = useDebouncedCallback(async (search: string) => {
    const foundUsers = await lookupUsersByPartialEmail(search);
    setUserOptions(
      foundUsers.map(user => ({ value: user.id, label: user.email }))
    );
  }, 500);

  const handleInviteeSearch = (search: string) => {
    debouncedLookup(search);
  };

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

    // If we have selected users, use the multi-RSVP action
    if (selectedUsers.length > 0) {
      if (!eventId) {
        toast.error('Event ID is required');
        return;
      }

      if (closeModal) closeModal();

      try {
        startMutation(async () => {
          const result = await createMultipleRsvpsAction({
            eventId: eventId,
            inviteeIds: selectedUsers.map(user => user.value),
          });

          if (typeof result === 'string') {
            // Error occurred
            toast.error('Failed to create RSVPs', {
              description: result,
            });
          } else {
            // Success
            router.refresh();
            if (postSuccess) postSuccess();
            toast.success(
              `Created ${result.count} RSVP${result.count !== 1 ? 's' : ''}!`
            );
          }
        });
      } catch (e) {
        if (e instanceof z.ZodError) {
          setErrors(e.flatten().fieldErrors);
        }
      }
      return;
    }

    // Original single RSVP logic for backward compatibility
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
          Invitees
        </Label>
        <div>
          <ComboBox
            options={userOptions}
            selectedOptions={selectedUsers}
            setSelectedOptions={setSelectedUsers}
            placeholder="Search users..."
            onSearchChange={handleInviteeSearch}
          />
        </div>
        {/* Optionally render errors here */}
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
      <SaveButton
        errors={hasErrors}
        editing={editing}
        hasSelectedUsers={selectedUsers.length > 0}
        hasEventId={!!eventId}
      />

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
  hasSelectedUsers,
  hasEventId,
}: {
  editing: boolean;
  errors: boolean;
  hasSelectedUsers: boolean;
  hasEventId: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;

  // Disable if we have selected users but no event ID, or if we have errors
  const isDisabled =
    isCreating || isUpdating || errors || (hasSelectedUsers && !hasEventId);

  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {editing
        ? `Sav${isUpdating ? 'ing...' : 'e'}`
        : `Creat${isCreating ? 'ing...' : 'e'}`}
    </Button>
  );
};
