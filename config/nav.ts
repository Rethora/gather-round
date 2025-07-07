import { SidebarLink } from '@/components/SidebarItems';
import {
  Cog,
  User,
  HomeIcon,
  Calendar,
  Bell,
  Users,
  Globe,
  UserCheck,
} from 'lucide-react';

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
    children: [
      { href: '/events/hosting', title: 'Hosting', icon: Users },
      { href: '/events/attending', title: 'Attending', icon: UserCheck },
      { href: '/events/public', title: 'Public', icon: Globe },
    ],
  },
];

export const accountLinks: SidebarLink[] = [
  { href: '/account', title: 'Account', icon: User },
  { href: '/settings', title: 'Settings', icon: Cog },
];
