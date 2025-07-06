'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { type CompleteNotification } from '@/lib/db/schema/notifications';
import { Mail, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NotificationType } from '@prisma/client';

interface NotificationDataTableProps {
  notifications: CompleteNotification[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: 'all' | 'read' | 'unread';
  type: NotificationType | 'all';
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange?: (search: string) => void;
  onStatusChange?: (status: 'all' | 'read' | 'unread') => void;
  onTypeChange?: (type: NotificationType | 'all') => void;
  onBulkMarkAsRead?: (notificationIds: string[]) => void;
}

const getNotificationTypeLabel = (type: string) => {
  switch (type) {
    case 'EVENT_UPDATE':
      return 'Event Update';
    case 'EVENT_CANCELED':
      return 'Event Canceled';
    case 'NEW_RSVP':
      return 'New RSVP';
    case 'RSVP_UPDATED':
      return 'RSVP Updated';
    case 'NEW_MENTION':
      return 'New Mention';
    case 'COMMENT':
      return 'Comment';
    default:
      return type;
  }
};

const getNotificationTypeColor = (type: string) => {
  switch (type) {
    case 'EVENT_UPDATE':
      return 'bg-blue-100 text-blue-800';
    case 'EVENT_CANCELED':
      return 'bg-red-100 text-red-800';
    case 'NEW_RSVP':
      return 'bg-green-100 text-green-800';
    case 'RSVP_UPDATED':
      return 'bg-yellow-100 text-yellow-800';
    case 'NEW_MENTION':
      return 'bg-purple-100 text-purple-800';
    case 'COMMENT':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export default function NotificationDataTable({
  notifications,
  total,
  page,
  pageSize,
  search,
  status,
  type,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onBulkMarkAsRead,
}: NotificationDataTableProps) {
  const pathname = usePathname();
  const basePath = pathname.includes('notifications')
    ? pathname
    : pathname + '/notifications/';

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Table columns with selection
  const columns: ColumnDef<CompleteNotification>[] = React.useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'isRead',
        header: 'Status',
        cell: ({ row }) => {
          const isRead = row.getValue('isRead') as boolean;
          return (
            <div className="flex items-center gap-2">
              {isRead ? (
                <MailOpen className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Mail className="h-4 w-4 text-blue-600" />
              )}
              <span className="text-sm">{isRead ? 'Read' : 'Unread'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.getValue('type') as string;
          return (
            <Badge className={getNotificationTypeColor(type)}>
              {getNotificationTypeLabel(type)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => {
          const title = row.getValue('title') as string;
          const id = row.original.id;
          return (
            <Link
              href={basePath + '/' + id}
              className="font-medium hover:underline"
            >
              {title}
            </Link>
          );
        },
      },
      {
        accessorKey: 'message',
        header: 'Message',
        cell: ({ row }) => {
          const message = row.getValue('message') as string;
          return (
            <div className="max-w-xs truncate text-sm text-muted-foreground">
              {message}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => {
          const date = row.getValue('createdAt') as Date;
          return (
            <span className="text-sm text-muted-foreground">
              {formatDate(date)}
            </span>
          );
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const notification = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(notification.id)}
                >
                  Copy notification ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem>Mark as read</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [basePath]
  );

  const table = useReactTable({
    data: notifications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedNotificationIds = selectedRows.map(row => row.original.id);

  const handleBulkMarkAsRead = () => {
    if (selectedNotificationIds.length > 0 && onBulkMarkAsRead) {
      onBulkMarkAsRead(selectedNotificationIds);
      setRowSelection({}); // Clear selection after action
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedNotificationIds.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedNotificationIds.length} notification
            {selectedNotificationIds.length !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkMarkAsRead}
            disabled={!onBulkMarkAsRead}
          >
            Mark as read
          </Button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={event => onSearchChange?.(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={status}
            onValueChange={value =>
              onStatusChange?.(value as 'all' | 'read' | 'unread')
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={type}
            onValueChange={value =>
              onTypeChange?.(value as NotificationType | 'all')
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="EVENT_UPDATE">Event Update</SelectItem>
              <SelectItem value="EVENT_CANCELED">Event Canceled</SelectItem>
              <SelectItem value="NEW_RSVP">New RSVP</SelectItem>
              <SelectItem value="RSVP_UPDATED">RSVP Updated</SelectItem>
              <SelectItem value="NEW_MENTION">New Mention</SelectItem>
              <SelectItem value="COMMENT">Comment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {notifications.length} of {total} notifications
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => {
                const notification = row.original;
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(!notification.isRead ? 'bg-muted/50' : '')}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="text-center">
                    <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
                      No notifications found
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {search || status !== 'all' || type !== 'all'
                        ? 'Try adjusting your search or filters.'
                        : 'You have no notifications at this time.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / pageSize)}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={String(pageSize)}
                onValueChange={value => onPageSizeChange?.(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map(size => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange?.(1)}
                disabled={page === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page === Math.ceil(total / pageSize)}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange?.(Math.ceil(total / pageSize))}
                disabled={page === Math.ceil(total / pageSize)}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
