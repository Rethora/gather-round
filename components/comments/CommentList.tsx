'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { type Comment, CompleteComment } from '@/lib/db/schema/comments';
import Modal from '@/components/shared/Modal';
import { type Event, type EventId } from '@/lib/db/schema/events';
import { useOptimisticComments } from '@/app/(app)/comments/useOptimisticComments';
import { Button } from '@/components/ui/button';
import CommentForm from './CommentForm';
import { PlusIcon } from 'lucide-react';
import { type Session } from '@/lib/auth/utils';

type TOpenModal = (comment?: Comment) => void;

export default function CommentList({
  comments,
  events,
  eventId,
  session,
}: {
  comments: CompleteComment[];
  events: Event[];
  eventId?: EventId;
  session: Session;
}) {
  const { optimisticComments, addOptimisticComment } = useOptimisticComments(
    comments,
    events
  );
  const [open, setOpen] = useState(false);
  const [activeComment, setActiveComment] = useState<Comment | null>(null);
  const openModal = (comment?: Comment) => {
    setOpen(true);
    if (comment) setActiveComment(comment);
    else setActiveComment(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeComment ? 'Edit Comment' : 'Create Comment'}
      >
        <CommentForm
          comment={activeComment}
          addOptimistic={addOptimisticComment}
          openModal={openModal}
          closeModal={closeModal}
          events={events}
          eventId={eventId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={'outline'}>
          +
        </Button>
      </div>
      {optimisticComments.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticComments.map(comment => (
            <Comment
              comment={comment}
              key={comment.id}
              openModal={openModal}
              session={session}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Comment = ({
  comment,
  openModal: _,
  session,
}: {
  comment: CompleteComment;
  openModal: TOpenModal;
  session: Session;
}) => {
  const optimistic = comment.id === 'optimistic';
  const deleting = comment.id === 'delete';
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes('comments')
    ? pathname
    : pathname + '/comments/';

  return (
    <li
      className={cn(
        'flex justify-between my-2',
        mutating ? 'opacity-30 animate-pulse' : '',
        deleting ? 'text-destructive' : ''
      )}
    >
      <div className="w-full">
        <div>{comment.content}</div>
      </div>
      {comment.userId === session.user.id && (
        <Button variant={'link'} asChild>
          <Link href={basePath + '/' + comment.id}>Edit</Link>
        </Button>
      )}
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No comments
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new comment.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Comments{' '}
        </Button>
      </div>
    </div>
  );
};
