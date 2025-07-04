'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { db } from '@/lib/db/index';

import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import { lucia, validateRequest } from '../auth/lucia';
import {
  genericError,
  setAuthCookie,
  validateAuthFormData,
  getUserAuth,
} from '../auth/utils';

import { updateUserSchema } from '@/lib/db/schema/auth';
import { getUsersByPartialEmail } from '@/lib/api/users/queries';

interface ActionResult {
  error: string;
}

export async function signInAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { data, error } = validateAuthFormData(formData);
  if (error !== null) return { error };

  try {
    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (!existingUser) {
      return {
        error: 'Incorrect username or password',
      };
    }

    const validPassword = await new Argon2id().verify(
      existingUser.hashedPassword,
      data.password
    );
    if (!validPassword) {
      return {
        error: 'Incorrect username or password',
      };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    setAuthCookie(sessionCookie);

    return redirect('/dashboard');
  } catch {
    return genericError;
  }
}

export async function signUpAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { data, error } = validateAuthFormData(formData);

  if (error !== null) return { error };

  const hashedPassword = await new Argon2id().hash(data.password);
  const userId = generateId(15);

  try {
    await db.user.create({
      data: {
        id: userId,
        email: data.email,
        hashedPassword,
      },
    });
  } catch {
    return genericError;
  }

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  setAuthCookie(sessionCookie);
  return redirect('/dashboard');
}

export async function signOutAction(): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: 'Unauthorized',
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  setAuthCookie(sessionCookie);
  redirect('/sign-in');
}

export async function updateUser(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult & { success?: boolean }> {
  const { session } = await getUserAuth();
  if (!session) return { error: 'Unauthorised' };

  const name = formData.get('name') ?? undefined;
  const email = formData.get('email') ?? undefined;

  const result = updateUserSchema.safeParse({ name, email });

  if (!result.success) {
    const error = result.error.flatten().fieldErrors;
    if (error.name) return { error: 'Invalid name - ' + error.name[0] };
    if (error.email) return { error: 'Invalid email - ' + error.email[0] };
    return genericError;
  }

  try {
    await db.user.update({
      data: { ...result.data },
      where: { id: session.user.id },
    });
    revalidatePath('/account');
    return { success: true, error: '' };
  } catch {
    return genericError;
  }
}

export const lookupUsersByPartialEmail = async (partialEmail: string) => {
  const { session } = await getUserAuth();
  if (!session) return [];
  return (await getUsersByPartialEmail(partialEmail))
    .filter(user => user.id !== session.user.id)
    .map(user => ({
      id: user.id,
      email: user.email,
    }));
};

export const getUserById = async (id: string) => {
  return await db.user.findUnique({ where: { id } });
};
