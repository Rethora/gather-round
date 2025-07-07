import { db } from '@/lib/db/index';
import { getUserAuth } from '@/lib/auth/utils';
import { type EventId, eventIdSchema } from '@/lib/db/schema/events';
import { Prisma } from '@prisma/client';

export const getPublicEvents = async () => {
  const e = await db.event.findMany({
    where: {
      isPrivate: false,
    },
    include: {
      rsvps: { include: { invitee: true } },
    },
    orderBy: {
      dateTime: 'asc',
    },
  });
  return { events: e };
};

export interface GetPublicEventsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const getPublicEventsPaginated = async ({
  page = 1,
  pageSize = 10,
  search = '',
}: GetPublicEventsParams = {}) => {
  const { session } = await getUserAuth();
  if (!session?.user.id) return { events: [], total: 0 };

  const where: Prisma.EventWhereInput = {
    isPrivate: false,
    isCanceled: false,
    dateTime: {
      gte: new Date(), // Only future events
    },
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  const total = await db.event.count({ where });
  const events = await db.event.findMany({
    where,
    include: {
      rsvps: { include: { invitee: true } },
    },
    orderBy: {
      dateTime: 'asc',
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { events, total };
};

export const getEvents = async () => {
  const { session } = await getUserAuth();
  const e = await db.event.findMany({
    where: {
      OR: [
        { userId: session?.user.id },
        { rsvps: { some: { inviteeId: session?.user.id } } },
      ],
    },
    include: {
      rsvps: { include: { invitee: true } },
    },
    orderBy: {
      dateTime: 'asc',
    },
  });
  return { events: e };
};

export interface GetEventsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const getEventsPaginated = async ({
  page = 1,
  pageSize = 10,
  search = '',
}: GetEventsParams = {}) => {
  const { session } = await getUserAuth();
  if (!session?.user.id)
    return { events: [], total: 0, hostingTotal: 0, attendingTotal: 0 };

  const where: Prisma.EventWhereInput = {
    OR: [
      { userId: session?.user.id },
      { rsvps: { some: { inviteeId: session?.user.id } } },
    ],
  };

  if (search) {
    where.AND = [
      {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      },
    ];
  }

  const total = await db.event.count({ where });

  // Get hosting events count
  const hostingWhere: Prisma.EventWhereInput = {
    userId: session?.user.id,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };
  const hostingTotal = await db.event.count({ where: hostingWhere });

  // Get attending events count
  const attendingWhere: Prisma.EventWhereInput = {
    rsvps: { some: { inviteeId: session?.user.id } },
    userId: { not: session?.user.id },
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };
  const attendingTotal = await db.event.count({ where: attendingWhere });

  const events = await db.event.findMany({
    where,
    include: {
      rsvps: { include: { invitee: true } },
    },
    orderBy: {
      dateTime: 'asc',
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { events, total, hostingTotal, attendingTotal };
};

export const getEventById = async (id: EventId) => {
  const { session } = await getUserAuth();
  const { id: eventId } = eventIdSchema.parse({ id });
  const e = await db.event.findFirst({
    where: {
      id: eventId,
      OR: [
        { userId: session?.user.id },
        { rsvps: { some: { inviteeId: session?.user.id } } },
        { isPrivate: false },
      ],
    },
  });
  return { event: e };
};

export const getEventByIdWithRsvpsWithUsersAndComments = async (
  id: EventId
) => {
  const { session } = await getUserAuth();
  const { id: eventId } = eventIdSchema.parse({ id });
  const e = await db.event.findFirst({
    where: {
      id: eventId,
      OR: [
        { userId: session?.user.id },
        { rsvps: { some: { inviteeId: session?.user.id } } },
        { isPrivate: false },
      ],
    },
    include: {
      rsvps: { include: { event: true, invitee: true } },
      comments: { include: { event: true } },
    },
  });
  if (e === null) return { event: null };
  const { rsvps, comments, ...event } = e;

  return { event, rsvps: rsvps, comments: comments };
};

export interface GetHostingEventsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const getHostingEventsPaginated = async ({
  page = 1,
  pageSize = 10,
  search = '',
}: GetHostingEventsParams = {}) => {
  const { session } = await getUserAuth();
  if (!session?.user.id) return { events: [], total: 0 };

  const where: Prisma.EventWhereInput = {
    userId: session?.user.id,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const total = await db.event.count({ where });
  const events = await db.event.findMany({
    where,
    include: {
      rsvps: { include: { invitee: true } },
    },
    orderBy: {
      dateTime: 'asc',
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { events, total };
};

export interface GetAttendingEventsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const getAttendingEventsPaginated = async ({
  page = 1,
  pageSize = 10,
  search = '',
}: GetAttendingEventsParams = {}) => {
  const { session } = await getUserAuth();
  if (!session?.user.id) return { events: [], total: 0 };

  const where: Prisma.EventWhereInput = {
    rsvps: { some: { inviteeId: session?.user.id } },
    userId: { not: session?.user.id },
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const total = await db.event.count({ where });
  const events = await db.event.findMany({
    where,
    include: {
      rsvps: { include: { invitee: true } },
    },
    orderBy: {
      dateTime: 'asc',
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { events, total };
};
