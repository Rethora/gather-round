import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/(app)/notifications/useOptimisticNotifications';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBackPath } from '@/components/shared/BackButton';

import { Checkbox } from '@/components/ui/checkbox';

import {
  type Notification,
  insertNotificationParams,
} from '@/lib/db/schema/notifications';
import {
  createNotificationAction,
  deleteNotificationAction,
  updateNotificationAction,
} from '@/lib/actions/notifications';

const NotificationForm = ({
  notification,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  notification?: Notification | null;

  openModal?: (notification?: Notification) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Notification>(insertNotificationParams);
  const editing = !!notification?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath('notifications');

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Notification }
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
      toast.success(`Notification ${action}d!`);
      if (action === 'delete') router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const notificationParsed = await insertNotificationParams.safeParseAsync({
      ...payload,
    });
    if (!notificationParsed.success) {
      setErrors(notificationParsed?.error.flatten().fieldErrors);
      return;
    }

    if (closeModal) closeModal();
    const values = notificationParsed.data;
    const pendingNotification: Notification = {
      createdAt: notification?.createdAt ?? new Date(),
      id: notification?.id ?? '',
      userId: notification?.userId ?? '',
      relatedEventId: notification?.relatedEventId ?? '',
      relatedCommentId: notification?.relatedCommentId ?? '',
      type: notification?.type ?? 'EVENT_UPDATE',
      message: notification?.message ?? '',
      title: notification?.title ?? '',
      isRead: notification?.isRead ?? false,
      ...values,
    };
    try {
      startMutation(async () => {
        if (addOptimistic)
          addOptimistic({
            data: pendingNotification,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updateNotificationAction({ ...values, id: notification.id })
          : await createNotificationAction(values);

        const errorFormatted = {
          error: error ?? 'Error',
          values: pendingNotification,
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
            errors?.type ? 'text-destructive' : ''
          )}
        >
          Type
        </Label>
        <Input
          type="text"
          name="type"
          className={cn(errors?.type ? 'ring ring-destructive' : '')}
          defaultValue={notification?.type ?? ''}
        />
        {errors?.type ? (
          <p className="text-xs text-destructive mt-2">{errors.type[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
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
          defaultValue={notification?.title ?? ''}
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
            errors?.message ? 'text-destructive' : ''
          )}
        >
          Message
        </Label>
        <Input
          type="text"
          name="message"
          className={cn(errors?.message ? 'ring ring-destructive' : '')}
          defaultValue={notification?.message ?? ''}
        />
        {errors?.message ? (
          <p className="text-xs text-destructive mt-2">{errors.message[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.isRead ? 'text-destructive' : ''
          )}
        >
          Is Read
        </Label>
        <br />
        <Checkbox
          defaultChecked={notification?.isRead}
          name={'isRead'}
          className={cn(errors?.isRead ? 'ring ring-destructive' : '')}
        />
        {errors?.isRead ? (
          <p className="text-xs text-destructive mt-2">{errors.isRead[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.relatedEventId ? 'text-destructive' : ''
          )}
        >
          Related Event Id
        </Label>
        <Input
          type="text"
          name="relatedEventId"
          className={cn(errors?.relatedEventId ? 'ring ring-destructive' : '')}
          defaultValue={notification?.relatedEventId ?? ''}
        />
        {errors?.relatedEventId ? (
          <p className="text-xs text-destructive mt-2">
            {errors.relatedEventId[0]}
          </p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.relatedCommentId ? 'text-destructive' : ''
          )}
        >
          Related Comment Id
        </Label>
        <Input
          type="text"
          name="relatedCommentId"
          className={cn(
            errors?.relatedCommentId ? 'ring ring-destructive' : ''
          )}
          defaultValue={notification?.relatedCommentId ?? ''}
        />
        {errors?.relatedCommentId ? (
          <p className="text-xs text-destructive mt-2">
            {errors.relatedCommentId[0]}
          </p>
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
                addOptimistic({ action: 'delete', data: notification });
              const error = await deleteNotificationAction(notification.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? 'Error',
                values: notification,
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

export default NotificationForm;

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
