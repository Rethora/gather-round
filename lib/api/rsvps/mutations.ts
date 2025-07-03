import { db } from "@/lib/db/index";
import { 
  RsvpId, 
  NewRsvpParams,
  UpdateRsvpParams, 
  updateRsvpSchema,
  insertRsvpSchema, 
  rsvpIdSchema 
} from "@/lib/db/schema/rsvps";
import { getUserAuth } from "@/lib/auth/utils";

export const createRsvp = async (rsvp: NewRsvpParams) => {
  const { session } = await getUserAuth();
  const newRsvp = insertRsvpSchema.parse({ ...rsvp, userId: session?.user.id! });
  try {
    const r = await db.rsvp.create({ data: newRsvp });
    return { rsvp: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateRsvp = async (id: RsvpId, rsvp: UpdateRsvpParams) => {
  const { session } = await getUserAuth();
  const { id: rsvpId } = rsvpIdSchema.parse({ id });
  const newRsvp = updateRsvpSchema.parse({ ...rsvp, userId: session?.user.id! });
  try {
    const r = await db.rsvp.update({ where: { id: rsvpId, userId: session?.user.id! }, data: newRsvp})
    return { rsvp: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteRsvp = async (id: RsvpId) => {
  const { session } = await getUserAuth();
  const { id: rsvpId } = rsvpIdSchema.parse({ id });
  try {
    const r = await db.rsvp.delete({ where: { id: rsvpId, userId: session?.user.id! }})
    return { rsvp: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

