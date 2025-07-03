'use server';

import { revalidatePath } from 'next/cache';
import { createRsvp, deleteRsvp, updateRsvp } from '@/lib/api/rsvps/mutations';
import {
  RsvpId,
  NewRsvpParams,
  UpdateRsvpParams,
  rsvpIdSchema,
  insertRsvpParams,
  updateRsvpParams,
} from '@/lib/db/schema/rsvps';

const handleErrors = (e: unknown) => {
  const errMsg = 'Error, please try again.';
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === 'object' && 'error' in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateRsvps = () => revalidatePath('/rsvps');

export const createRsvpAction = async (input: NewRsvpParams) => {
  try {
    const payload = insertRsvpParams.parse(input);
    await createRsvp(payload);
    revalidateRsvps();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateRsvpAction = async (input: UpdateRsvpParams) => {
  try {
    const payload = updateRsvpParams.parse(input);
    await updateRsvp(payload.id, payload);
    revalidateRsvps();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteRsvpAction = async (input: RsvpId) => {
  try {
    const payload = rsvpIdSchema.parse({ id: input });
    await deleteRsvp(payload.id);
    revalidateRsvps();
  } catch (e) {
    return handleErrors(e);
  }
};
