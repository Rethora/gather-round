'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export const useScrollToComment = () => {
  const searchParams = useSearchParams();
  const commentId = searchParams.get('commentId');
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commentId && commentRef.current) {
      // Scroll to the comment
      commentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Add highlight class with a small delay to ensure the element is rendered
      const highlightTimeout = setTimeout(() => {
        if (commentRef.current) {
          commentRef.current.classList.add('comment-highlight');
        }
      }, 100);

      // Remove highlight after 3 seconds
      const removeTimeout = setTimeout(() => {
        if (commentRef.current) {
          commentRef.current.classList.remove('comment-highlight');
        }
      }, 3000);

      // Clean up timeouts
      return () => {
        clearTimeout(highlightTimeout);
        clearTimeout(removeTimeout);
      };
    }
  }, [commentId]);

  return { commentRef, commentId };
};
