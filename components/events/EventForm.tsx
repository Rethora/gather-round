import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/(app)/events/useOptimisticEvents';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBackPath } from '@/components/shared/BackButton';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

import { Checkbox } from '@/components/ui/checkbox';

import { type Event, insertEventParams } from '@/lib/db/schema/events';
import {
  createEventAction,
  deleteEventAction,
  updateEventAction,
} from '@/lib/actions/events';

const EventForm = ({
  event,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  event?: Event | null;

  openModal?: (event?: Event) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Event>(insertEventParams);
  const editing = !!event?.id;

  // Initialize dateTime with the event's dateTime or current date/time
  const [dateTime, setDateTime] = useState<Date | undefined>(event?.dateTime);

  // Initialize time string for the time input
  const [timeString, setTimeString] = useState<string>(
    event?.dateTime?.toTimeString().slice(0, 5) ?? ''
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath('events');

  // Function to combine date and time
  const combineDateAndTime = (date: Date, timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  // Handle date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && timeString) {
      const combined = combineDateAndTime(selectedDate, timeString);
      setDateTime(combined);
    } else if (selectedDate) {
      setDateTime(selectedDate);
    }
  };

  // Handle time change
  const handleTimeChange = (newTimeString: string) => {
    setTimeString(newTimeString);
    if (dateTime && newTimeString) {
      const combined = combineDateAndTime(dateTime, newTimeString);
      setDateTime(combined);
    }
  };

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Event }
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
      toast.success(`Event ${action}d!`);
      if (action === 'delete') router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const eventParsed = await insertEventParams.safeParseAsync({ ...payload });
    if (!eventParsed.success) {
      setErrors(eventParsed?.error.flatten().fieldErrors);
      return;
    }

    if (closeModal) closeModal();
    const values = eventParsed.data;
    const pendingEvent: Event = {
      updatedAt: event?.updatedAt ?? new Date(),
      createdAt: event?.createdAt ?? new Date(),
      id: event?.id ?? '',
      userId: event?.userId ?? '',
      ...values,
    };
    try {
      startMutation(async () => {
        if (addOptimistic)
          addOptimistic({
            data: pendingEvent,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updateEventAction({ ...values, id: event.id })
          : await createEventAction(values);

        const errorFormatted = {
          error: typeof error === 'string' ? error : 'Error',
          values: pendingEvent,
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
            errors?.title ? 'text-destructive' : ''
          )}
        >
          Title
        </Label>
        <Input
          type="text"
          name="title"
          className={cn(errors?.title ? 'ring ring-destructive' : '')}
          defaultValue={event?.title ?? ''}
          required
        />
        {errors?.title ? (
          <p className="text-xs text-destructive mt-2">{errors.title[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.description ? 'text-destructive' : ''
          )}
        >
          Description
        </Label>
        <Input
          type="text"
          name="description"
          className={cn(errors?.description ? 'ring ring-destructive' : '')}
          defaultValue={event?.description ?? ''}
        />
        {errors?.description ? (
          <p className="text-xs text-destructive mt-2">
            {errors.description[0]}
          </p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.dateTime ? 'text-destructive' : ''
          )}
        >
          Date & Time
        </Label>
        <div className="flex gap-2 items-start">
          <Popover>
            <Input
              name="dateTime"
              onChange={() => {}}
              readOnly
              value={dateTime?.toISOString() ?? new Date().toISOString()}
              className="hidden"
              required
            />

            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[200px] pl-3 text-left font-normal',
                  !dateTime && 'text-muted-foreground'
                )}
              >
                {dateTime ? (
                  <span>{format(dateTime, 'PPP')}</span>
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                onSelect={handleDateSelect}
                selected={dateTime}
                disabled={date => date < new Date('1900-01-01')}
                required
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={timeString}
              onChange={e => handleTimeChange(e.target.value)}
              className="w-[120px]"
              required
            />
          </div>
        </div>
        {errors?.dateTime ? (
          <p className="text-xs text-destructive mt-2">{errors.dateTime[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.location ? 'text-destructive' : ''
          )}
        >
          Location
        </Label>
        <Input
          type="text"
          name="location"
          className={cn(errors?.location ? 'ring ring-destructive' : '')}
          defaultValue={event?.location ?? ''}
          required
        />
        {errors?.location ? (
          <p className="text-xs text-destructive mt-2">{errors.location[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.maxGuests ? 'text-destructive' : ''
          )}
        >
          Max Guests
        </Label>
        <Input
          type="text"
          name="maxGuests"
          className={cn(errors?.maxGuests ? 'ring ring-destructive' : '')}
          defaultValue={event?.maxGuests ?? ''}
          required
        />
        {errors?.maxGuests ? (
          <p className="text-xs text-destructive mt-2">{errors.maxGuests[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.imageUrl ? 'text-destructive' : ''
          )}
        >
          Image Url
        </Label>
        <Input
          type="text"
          name="imageUrl"
          className={cn(errors?.imageUrl ? 'ring ring-destructive' : '')}
          defaultValue={event?.imageUrl ?? ''}
        />
        {errors?.imageUrl ? (
          <p className="text-xs text-destructive mt-2">{errors.imageUrl[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.isPrivate ? 'text-destructive' : ''
          )}
        >
          Is Private
        </Label>
        <br />
        <Checkbox
          defaultChecked={event?.isPrivate}
          name={'isPrivate'}
          className={cn(errors?.isPrivate ? 'ring ring-destructive' : '')}
        />
        {errors?.isPrivate ? (
          <p className="text-xs text-destructive mt-2">{errors.isPrivate[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
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
                addOptimistic({ action: 'delete', data: event });
              const error = await deleteEventAction(event.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: typeof error === 'string' ? error : 'Error',
                values: event,
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

export default EventForm;

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
