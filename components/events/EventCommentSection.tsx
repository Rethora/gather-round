'use client';

import { useState } from 'react';
import { type CompleteComment } from '@/lib/db/schema/comments';
import { type Event, type EventId } from '@/lib/db/schema/events';
import { type Session } from '@/lib/auth/utils';
import { useOptimisticComments } from '@/lib/hooks/useOptimisticComments';
import Modal from '@/components/shared/Modal';
import CommentForm from '@/components/comments/CommentForm';
import CommentList from '@/components/comments/CommentList';
import { type Comment } from '@/lib/db/schema/comments';

export default function EventCommentSection({
  comments,
  events,
  eventId,
  session,
}: {
  comments: CompleteComment[];
  events: Event[];
  eventId: EventId;
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
    <div className="relative mt-8 mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">Comments</h3>
      </div>

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

      <CommentList
        comments={optimisticComments}
        events={events}
        eventId={eventId}
        session={session}
        openModal={openModal}
      />
    </div>
  );
}
