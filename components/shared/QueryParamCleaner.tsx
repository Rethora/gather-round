'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function QueryParamCleaner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const commentId = searchParams.get('commentId');

  useEffect(() => {
    if (commentId) {
      // Remove the commentId parameter from the URL after a short delay
      // to ensure the scroll and highlight have time to work
      const timeout = setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('commentId');
        const newUrl =
          window.location.pathname +
          (newSearchParams.toString() ? `?${newSearchParams.toString()}` : '');
        router.replace(newUrl, { scroll: false });
      }, 3500); // Slightly longer than the highlight animation

      return () => clearTimeout(timeout);
    }
  }, [commentId, router, searchParams]);

  return null;
}
