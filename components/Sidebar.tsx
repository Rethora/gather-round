'use client';

import Link from 'next/link';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

import SidebarItems from './SidebarItems';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import SignOutBtn from './auth/SignOutBtn';
import { useSidebar } from '@/lib/hooks/useSidebar';
import { AuthSession } from '@/lib/auth/utils';

interface SidebarProps {
  session: AuthSession;
}

const Sidebar = ({ session }: SidebarProps) => {
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } =
    useSidebar();

  if (session.session === null) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          h-screen bg-muted border-r border-border shadow-inner
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-52'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col justify-between h-full p-4 pt-8">
          <div className="space-y-4">
            {/* Header with toggle button */}
            <div className="flex items-center justify-between">
              {!isCollapsed && <h3 className="text-lg font-semibold">Logo</h3>}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapsed}
                className="md:flex hidden h-8 w-8 p-0"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMobile}
                className="md:hidden h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Sidebar items */}
            <SidebarItems isCollapsed={isCollapsed} />
          </div>

          {/* User details */}
          <UserDetails session={session} isCollapsed={isCollapsed} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

const UserDetails = ({
  session,
  isCollapsed,
}: {
  session: AuthSession;
  isCollapsed: boolean;
}) => {
  if (session.session === null) return null;
  const { user } = session.session;

  // Always show user details, even if name is not set
  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'user@example.com';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map(word => word[0]?.toUpperCase())
        .join('')
    : 'U';

  return (
    <div className="border-t border-border pt-4">
      <Link href="/account">
        <div
          className={`
          flex items-center justify-between w-full px-2 mb-3
          ${isCollapsed ? 'justify-center' : ''}
        `}
        >
          {!isCollapsed && (
            <div className="text-muted-foreground">
              <p className="text-xs">{displayName}</p>
              <p className="text-xs font-light pr-4">{displayEmail}</p>
            </div>
          )}
          <Avatar className="h-10 w-10">
            <AvatarFallback className="border-border border-2 text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </Link>

      {/* Sign out button */}
      <div className={isCollapsed ? 'flex justify-center' : ''}>
        <SignOutBtn variant={isCollapsed ? 'compact' : 'default'} />
      </div>
    </div>
  );
};

// Mobile toggle button component
export const SidebarToggle = () => {
  const { toggleMobile } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleMobile}
      className="md:hidden h-8 w-8 p-0"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
};
