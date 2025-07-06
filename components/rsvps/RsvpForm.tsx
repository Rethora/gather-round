import { z } from 'zod';

import { useState, useTransition, useEffect } from 'react';
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
  checkEventCapacityAction,
} from '@/lib/actions/rsvps';
import { type Event, type EventId } from '@/lib/db/schema/events';
import { lookupUsersByPartialEmail } from '@/lib/actions/users';
import { ComboBox } from '@/components/ui/combo-box';
import { usePollingContext } from '@/lib/hooks/usePollingContext';

const RsvpForm = ({
  events,
  eventId,
  rsvp,
  existingRsvps = [],
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  rsvp?: Rsvp | null;
  events: Event[];
  eventId?: EventId;
  existingRsvps?: Array<{ inviteeId: string; invitee?: { email: string } }>;
  openModal?: (rsvp?: Rsvp) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Rsvp>(insertRsvpParams);
  const editing = !!rsvp?.id;
  const { pausePolling, resumePolling } = usePollingContext();

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  // Multi-select ComboBox state
  const [selectedUsers, setSelectedUsers] = useState<
    { value: string; label: string }[]
  >([]);
  const [userOptions, setUserOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Existing RSVPs state
  const [existingRsvpUsers, setExistingRsvpUsers] = useState<
    { value: string; label: string }[]
  >([]);

  // Capacity checking state
  const [capacityInfo, setCapacityInfo] = useState<{
    effectiveGuests: number;
    maxGuests: number;
    availableSpots: number;
    canAddGuests: boolean;
  } | null>(null);

  // Pause polling when form is being used
  useEffect(() => {
    pausePolling();
    return () => {
      resumePolling();
    };
  }, [pausePolling, resumePolling]);

  // Process existing RSVPs when component mounts or props change
  useEffect(() => {
    const existingUsers = existingRsvps.map(rsvp => ({
      value: rsvp.inviteeId,
      label: rsvp.invitee?.email || rsvp.inviteeId,
    }));
    setExistingRsvpUsers(existingUsers);
    // Pre-populate selected users with existing RSVPs
    setSelectedUsers(existingUsers);
  }, [existingRsvps]);

  // Debounced DB query for user lookup
  const debouncedLookup = useDebouncedCallback(async (search: string) => {
    const foundUsers = await lookupUsersByPartialEmail(search);

    // Filter out users who are already invited
    const filteredUsers = foundUsers.filter(
      user => !existingRsvpUsers.some(existing => existing.value === user.id)
    );

    setUserOptions(
      filteredUsers.map(user => ({ value: user.id, label: user.email }))
    );
  }, 500);

  const handleInviteeSearch = (search: string) => {
    debouncedLookup(search);
  };

  // Check capacity when selected users change
  const checkCapacity = async (
    newSelectedUsers: { value: string; label: string }[]
  ) => {
    if (!eventId || newSelectedUsers.length === 0) {
      setCapacityInfo(null);
      return;
    }

    try {
      // Only count new invitees for capacity checking
      const newInvitees = newSelectedUsers.filter(
        user =>
          !existingRsvpUsers.some(existing => existing.value === user.value)
      );

      const result = await checkEventCapacityAction(
        eventId,
        newInvitees.length
      );
      if (result.success && result.canAddGuests !== undefined) {
        setCapacityInfo({
          effectiveGuests: result.effectiveGuests,
          maxGuests: result.maxGuests,
          availableSpots: result.availableSpots,
          canAddGuests: result.canAddGuests,
        });

        if (!result.canAddGuests && newInvitees.length > 0) {
          toast.error('Event at capacity', {
            description: `Cannot add ${newInvitees.length} new guest(s). Event capacity is ${result.maxGuests} and currently has ${result.effectiveGuests} reserved spots.`,
          });
        }
      }
    } catch (error) {
      console.error('Error checking capacity:', error);
    }
  };

  // Handle user selection with capacity checking
  const handleUserSelection = (
    newSelectedUsers: { value: string; label: string }[]
  ) => {
    setSelectedUsers(newSelectedUsers);
    checkCapacity(newSelectedUsers);
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

      // Check capacity one more time before submitting
      if (capacityInfo && !capacityInfo.canAddGuests) {
        toast.error('Cannot proceed - event at capacity');
        return;
      }

      if (closeModal) closeModal();

      try {
        startMutation(async () => {
          // Filter out users who are already invited (they're already in existingRsvps)
          const newInvitees = selectedUsers.filter(
            user =>
              !existingRsvpUsers.some(existing => existing.value === user.value)
          );

          if (newInvitees.length === 0) {
            toast.info(
              'No new users to invite - all selected users are already invited'
            );
            return;
          }

          const result = await createMultipleRsvpsAction({
            eventId: eventId,
            inviteeIds: newInvitees.map(user => user.value),
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
            setSelectedOptions={handleUserSelection}
            placeholder="Search users..."
            onSearchChange={handleInviteeSearch}
          />
        </div>
        {/* Show existing invitees */}
        {existingRsvpUsers.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Already invited:</p>
            <div className="flex flex-wrap gap-2">
              {existingRsvpUsers.map(user => (
                <span
                  key={user.value}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {user.label}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Capacity info display */}
        {capacityInfo && (
          <div className="mt-2 text-sm">
            <p
              className={cn(
                capacityInfo.canAddGuests ? 'text-green-600' : 'text-red-600'
              )}
            >
              {capacityInfo.effectiveGuests}/{capacityInfo.maxGuests} reserved
              spots
              {capacityInfo.availableSpots > 0 &&
                ` (${capacityInfo.availableSpots} spots available)`}
            </p>
          </div>
        )}
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
        capacityExceeded={capacityInfo ? !capacityInfo.canAddGuests : false}
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
  capacityExceeded,
}: {
  editing: boolean;
  errors: boolean;
  hasSelectedUsers: boolean;
  hasEventId: boolean;
  capacityExceeded: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;

  // Disable if we have selected users but no event ID, if we have errors, or if capacity is exceeded
  const isDisabled =
    isCreating ||
    isUpdating ||
    errors ||
    (hasSelectedUsers && !hasEventId) ||
    capacityExceeded;

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
