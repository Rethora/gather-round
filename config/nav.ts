import { SidebarLink } from '@/components/SidebarItems';
import { Cog, User, HomeIcon, Calendar, Bell } from 'lucide-react';

export const defaultLinks: SidebarLink[] = [
  { href: '/dashboard', title: 'Home', icon: HomeIcon },
  {
    href: '/notifications',
    title: 'Notifications',
    icon: Bell,
  },
];

export const additionalLinks: SidebarLink[] = [
  {
    href: '/events',
    title: 'Events',
    icon: Calendar,
  },
];

export const accountLinks: SidebarLink[] = [
  { href: '/account', title: 'Account', icon: User },
  { href: '/settings', title: 'Settings', icon: Cog },
];
