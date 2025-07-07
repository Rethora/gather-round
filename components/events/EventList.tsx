'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { type CompleteEvent } from '@/lib/db/schema/events';
import { type Session } from '@/lib/auth/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import {
  HostingEventCard,
  AttendingEventCard,
  PublicEventCard,
} from './EventCard';

interface EventListProps {
  events: CompleteEvent[];
  session?: Session;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  eventType: 'hosting' | 'attending' | 'public';
}

export default function EventList({
  events,
  session,
  total,
  page,
  pageSize,
  search,
  searchPlaceholder = 'Search events...',
  emptyMessage = 'No events found.',
  eventType,
}: EventListProps) {
  const [searchValue, setSearchValue] = useState(search);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearchParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateSearchParams({ search: value, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage.toString() });
  };

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const renderEvent = (event: CompleteEvent) => {
    switch (eventType) {
      case 'hosting':
        return <HostingEventCard key={event.id} event={event} />;
      case 'attending':
        return session ? (
          <AttendingEventCard key={event.id} event={event} session={session} />
        ) : null;
      case 'public':
        return <PublicEventCard key={event.id} event={event} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={e => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div>
          <div className="space-y-4 mb-6">{events.map(renderEvent)}</div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, total)} of {total} events
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
