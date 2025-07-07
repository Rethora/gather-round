'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

import { cn } from '@/lib/utils';
import { type Comment, CompleteComment } from '@/lib/db/schema/comments';
import Modal from '@/components/shared/Modal';
import { type Event, type EventId } from '@/lib/db/schema/events';
import { useOptimisticComments } from '@/lib/hooks/useOptimisticComments';
import { useScrollToComment } from '@/lib/hooks/useScrollToComment';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CommentForm from './CommentForm';
import { PencilIcon, PlusIcon, UserIcon } from 'lucide-react';
import { type Session } from '@/lib/auth/utils';

type TOpenModal = (comment?: Comment) => void;

export default function CommentList({
  comments,
  events,
  eventId,
  session,
  openModal: externalOpenModal,
}: {
  comments: CompleteComment[];
  events: Event[];
  eventId?: EventId;
  session: Session;
  openModal?: TOpenModal;
}) {
  const { optimisticComments, addOptimisticComment } = useOptimisticComments(
    comments,
    events
  );
  const [open, setOpen] = useState(false);
  const [activeComment, setActiveComment] = useState<Comment | null>(null);

  // Use external openModal if provided, otherwise use internal state
  const openModal =
    externalOpenModal ||
    ((comment?: Comment) => {
      setOpen(true);
      if (comment) setActiveComment(comment);
      else setActiveComment(null);
    });

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
        <div className="space-y-4">
          {optimisticComments.map(comment => (
            <Comment
              comment={comment}
              key={comment.id}
              openModal={openModal}
              session={session}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const Comment = ({
  comment,
  openModal,
  session,
}: {
  comment: CompleteComment;
  openModal: TOpenModal;
  session: Session;
}) => {
  const optimistic = comment.id === 'optimistic';
  const deleting = comment.id === 'delete';
  const mutating = optimistic || deleting;

  const isCurrentUser = comment.userId === session.user.id;
  const userName = isCurrentUser
    ? session.user.name || 'You'
    : 'Anonymous User';
  const userInitials =
    userName === 'You' ? 'Y' : userName.charAt(0).toUpperCase();

  const { commentRef, commentId } = useScrollToComment();
  const isTargetComment = commentId === comment.id;

  return (
    <div
      ref={isTargetComment ? commentRef : undefined}
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm transition-all duration-300',
        mutating ? 'opacity-30 animate-pulse' : '',
        deleting ? 'border-destructive bg-destructive/5' : '',
        isTargetComment ? 'comment-highlight' : ''
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs font-medium">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {userName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <p className="text-sm text-foreground leading-relaxed">
            {comment.content}
          </p>
        </div>

        <div>
          {isCurrentUser && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => openModal(comment)}
              >
                <PencilIcon />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center py-8">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <UserIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-secondary-foreground mb-2">
        No comments yet
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Be the first to share your thoughts!
      </p>
      <Button onClick={() => openModal()}>
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Comment
      </Button>
    </div>
  );
};
