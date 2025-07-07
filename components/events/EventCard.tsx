'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { type CompleteEvent } from '@/lib/db/schema/events';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users } from 'lucide-react';
import { type Session } from '@/lib/auth/utils';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'YES':
      return 'text-green-600';
    case 'MAYBE':
      return 'text-yellow-600';
    case 'NO':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
};

export function HostingEventCard({ event }: { event: CompleteEvent }) {
  const optimistic = event.id === 'optimistic';
  const deleting = event.id === 'delete';
  const mutating = optimistic || deleting;

  const rsvpCounts =
    event.rsvps?.reduce(
      (acc, rsvp) => {
        acc[rsvp.status] = (acc[rsvp.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  return (
    <li
      className={cn(
        'border rounded-lg p-4 hover:bg-muted/50 transition-colors',
        mutating ? 'opacity-30 animate-pulse' : '',
        deleting ? 'border-destructive' : ''
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            {event.isCanceled && <Badge variant="destructive">Canceled</Badge>}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(event.dateTime)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {event.location}
            </div>
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="flex gap-4 text-xs">
            <span className="text-green-600">Yes: {rsvpCounts.YES || 0}</span>
            <span className="text-yellow-600">
              Maybe: {rsvpCounts.MAYBE || 0}
            </span>
            <span className="text-red-600">No: {rsvpCounts.NO || 0}</span>
            <span className="text-muted-foreground">
              Pending: {rsvpCounts.PENDING || 0}
            </span>
          </div>
        </div>

        <Button variant={'link'} asChild>
          <Link href={'/events/view/' + event.id}>View Details</Link>
        </Button>
      </div>
    </li>
  );
}

export function AttendingEventCard({
  event,
  session,
}: {
  event: CompleteEvent;
  session: Session;
}) {
  const optimistic = event.id === 'optimistic';
  const deleting = event.id === 'delete';
  const mutating = optimistic || deleting;

  const userRsvp = event.rsvps?.find(
    rsvp => rsvp.inviteeId === session.user.id
  );
  const rsvpStatus = userRsvp?.status || 'PENDING';

  return (
    <li
      className={cn(
        'border rounded-lg p-4 hover:bg-muted/50 transition-colors',
        mutating ? 'opacity-30 animate-pulse' : '',
        deleting ? 'border-destructive' : ''
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            {event.isCanceled && (
              <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                Canceled
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(event.dateTime)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {event.location}
            </div>
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Your RSVP:</span>
            <span
              className={cn(
                'text-sm font-semibold',
                getStatusColor(rsvpStatus)
              )}
            >
              {rsvpStatus}
            </span>
          </div>
        </div>

        <Button variant={'link'} asChild>
          <Link href={'/events/view/' + event.id}>View Details</Link>
        </Button>
      </div>
    </li>
  );
}

export function PublicEventCard({ event }: { event: CompleteEvent }) {
  return (
    <li className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            {event.isCanceled && (
              <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                Canceled
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(event.dateTime)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {event.location}
            </div>
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        <Button variant={'link'} asChild>
          <Link href={'/events/view/' + event.id}>View Details</Link>
        </Button>
      </div>
    </li>
  );
}
