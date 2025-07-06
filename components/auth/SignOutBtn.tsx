'use client';

import { Button } from '../ui/button';
import { useFormStatus } from 'react-dom';
import { signOutAction } from '@/lib/actions/users';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignOutBtnProps {
  variant?: 'default' | 'compact';
  className?: string;
}

// Wrapper action to handle the signOutAction properly
async function handleSignOut() {
  await signOutAction();
}

export default function SignOutBtn({
  variant = 'default',
  className,
}: SignOutBtnProps) {
  return (
    <form action={handleSignOut} className="w-full text-left">
      <Btn variant={variant} className={className} />
    </form>
  );
}

const Btn = ({ variant, className }: SignOutBtnProps) => {
  const { pending } = useFormStatus();

  if (variant === 'compact') {
    return (
      <Button
        type="submit"
        disabled={pending}
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8 p-0', className)}
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="destructive"
      className={cn('w-full', className)}
    >
      {pending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
};
