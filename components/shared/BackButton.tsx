'use client';

import { ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function useBackPath(currentResource: string) {
  const pathname = usePathname();
  const segmentCount = pathname.slice(1).split('/');
  const backPath =
    segmentCount.length > 2
      ? pathname.slice(0, pathname.indexOf(currentResource) - 1)
      : pathname.slice(0, pathname.indexOf(segmentCount[1]));
  return backPath;
}

export function BackButton({
  currentResource,
  backPath,
}: {
  /* must be in kebab-case */
  currentResource: string;
  backPath?: string;
}) {
  const calculatedBackPath = useBackPath(currentResource);
  const finalBackPath = backPath || calculatedBackPath;

  return (
    <Button variant={'ghost'} asChild>
      <Link href={finalBackPath}>
        <ChevronLeftIcon />
      </Link>
    </Button>
  );
}
