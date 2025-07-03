import { db } from '@/lib/db/index';

export const getUsersByPartialEmail = async (partialEmail: string) => {
  if (partialEmail.length < 3) return [];
  const foundUsers = await db.user.findMany({
    where: { email: { contains: partialEmail } },
  });
  return foundUsers;
};
