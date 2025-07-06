'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { type Event, CompleteEvent } from '@/lib/db/schema/events';
import Modal from '@/components/shared/Modal';

import { useOptimisticEvents } from '@/app/(app)/events/useOptimisticEvents';
import { Button } from '@/components/ui/button';
import EventForm from './EventForm';
import { PlusIcon, Calendar, Users } from 'lucide-react';
import { type Session } from '@/lib/auth/utils';
import { Badge } from '@/components/ui/badge';

type TOpenModal = (event?: Event) => void;

type TabType = 'hosting' | 'attending' | 'public';

export default function EventList({
  events,
  publicEvents,
  session,
}: {
  events: CompleteEvent[];
  publicEvents: CompleteEvent[];
  session: Session;
}) {
  const { optimisticEvents, addOptimisticEvent } = useOptimisticEvents(events);
  const [open, setOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('hosting');

  const openModal = (event?: Event) => {
    setOpen(true);
    if (event) setActiveEvent(event);
    else setActiveEvent(null);
  };
  const closeModal = () => setOpen(false);

  // Separate events by hosting vs attending
  const hostingEvents = optimisticEvents.filter(
    event => event.userId === session.user.id
  );
  const attendingEvents = optimisticEvents.filter(event => {
    const userRsvp = event.rsvps?.find(
      rsvp => rsvp.inviteeId === session.user.id
    );
    return userRsvp && event.userId !== session.user.id;
  });

  // Sort events by date (upcoming first)
  const sortEvents = (events: CompleteEvent[]) => {
    return events.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  };

  const sortPublicEvents = (events: CompleteEvent[]) => {
    return events.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  };

  const sortedHostingEvents = sortEvents(hostingEvents);
  const sortedAttendingEvents = sortEvents(attendingEvents);
  const sortedPublicEvents = sortPublicEvents(publicEvents);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeEvent ? 'Edit Event' : 'Create Event'}
      >
        <EventForm
          event={activeEvent}
          addOptimistic={addOptimisticEvent}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === 'hosting' ? 'default' : 'outline'}
          onClick={() => setActiveTab('hosting')}
          className="flex-1"
        >
          Hosting ({sortedHostingEvents.length})
        </Button>
        <Button
          variant={activeTab === 'attending' ? 'default' : 'outline'}
          onClick={() => setActiveTab('attending')}
          className="flex-1"
        >
          Attending ({sortedAttendingEvents.length})
        </Button>
        <Button
          variant={activeTab === 'public' ? 'default' : 'outline'}
          onClick={() => setActiveTab('public')}
          className="flex-1"
        >
          Browse ({sortedPublicEvents.length})
        </Button>
      </div>

      {/* Create Event Button */}
      <div className="absolute right-0 top-0">
        <Button onClick={() => openModal()} variant={'outline'}>
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'hosting' ? (
        <HostingTab events={sortedHostingEvents} openModal={openModal} />
      ) : activeTab === 'attending' ? (
        <AttendingTab
          events={sortedAttendingEvents}
          openModal={openModal}
          session={session}
        />
      ) : (
        <PublicTab events={sortedPublicEvents} openModal={openModal} />
      )}
    </div>
  );
}

const HostingTab = ({
  events,
  openModal,
}: {
  events: CompleteEvent[];
  openModal: TOpenModal;
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
          No events you&apos;re hosting
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first event to get started.
        </p>
        <div className="mt-6">
          <Button onClick={() => openModal()}>
            <PlusIcon className="h-4 w-4 mr-2" /> Create Event
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {events.map(event => (
        <HostingEvent key={event.id} event={event} openModal={openModal} />
      ))}
    </ul>
  );
};

const AttendingTab = ({
  events,
  openModal,
  session,
}: {
  events: CompleteEvent[];
  openModal: TOpenModal;
  session: Session;
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
          No events you&apos;re attending
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You haven&apos;t RSVP&apos;d to any events yet.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {events.map(event => (
        <AttendingEvent
          key={event.id}
          event={event}
          openModal={openModal}
          session={session}
        />
      ))}
    </ul>
  );
};

const PublicTab = ({
  events,
  openModal,
}: {
  events: CompleteEvent[];
  openModal: TOpenModal;
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
          No public events
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no public events available at the moment.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {events.map(event => (
        <PublicEvent key={event.id} event={event} openModal={openModal} />
      ))}
    </ul>
  );
};

const HostingEvent = ({
  event,
  openModal: _,
}: {
  event: CompleteEvent;
  openModal: TOpenModal;
}) => {
  const optimistic = event.id === 'optimistic';
  const deleting = event.id === 'delete';
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes('events')
    ? pathname
    : pathname + '/events/';

  // Count RSVPs by status
  const rsvpCounts =
    event.rsvps?.reduce(
      (acc, rsvp) => {
        acc[rsvp.status] = (acc[rsvp.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

          {/* RSVP Counts */}
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
          <Link href={basePath + '/' + event.id}>View Details</Link>
        </Button>
      </div>
    </li>
  );
};

const AttendingEvent = ({
  event,
  openModal: _,
  session,
}: {
  event: CompleteEvent;
  openModal: TOpenModal;
  session: Session;
}) => {
  const optimistic = event.id === 'optimistic';
  const deleting = event.id === 'delete';
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes('events')
    ? pathname
    : pathname + '/events/';

  // Find user's RSVP status
  const userRsvp = event.rsvps?.find(
    rsvp => rsvp.inviteeId === session.user.id
  );
  const rsvpStatus = userRsvp?.status || 'PENDING';

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

          {/* User's RSVP Status */}
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
          <Link href={basePath + '/' + event.id}>View Details</Link>
        </Button>
      </div>
    </li>
  );
};

const PublicEvent = ({
  event,
  openModal: _,
}: {
  event: CompleteEvent;
  openModal: TOpenModal;
}) => {
  const pathname = usePathname();
  const basePath = pathname.includes('events')
    ? pathname
    : pathname + '/events/';

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <Link href={basePath + '/' + event.id}>View Details</Link>
        </Button>
      </div>
    </li>
  );
};
