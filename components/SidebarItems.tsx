'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { accountLinks, additionalLinks, defaultLinks } from '@/config/nav';

export interface SidebarLink {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarItemsProps {
  isCollapsed?: boolean;
}

const SidebarItems = ({ isCollapsed = false }: SidebarItemsProps) => {
  return (
    <>
      <SidebarLinkGroup links={defaultLinks} isCollapsed={isCollapsed} />
      <SidebarLinkGroup links={additionalLinks} isCollapsed={isCollapsed} />
      <SidebarLinkGroup links={accountLinks} isCollapsed={isCollapsed} />
    </>
  );
};
export default SidebarItems;

const SidebarLinkGroup = ({
  links,
  title,
  border,
  isCollapsed,
}: {
  links: SidebarLink[];
  title?: string;
  border?: boolean;
  isCollapsed?: boolean;
}) => {
  const fullPathname = usePathname();
  const pathname = '/' + fullPathname.split('/')[1];

  return (
    <div className={border ? 'border-border border-t my-8 pt-4' : ''}>
      {title && !isCollapsed ? (
        <h4 className="px-2 mb-2 text-xs uppercase text-muted-foreground tracking-wider">
          {title}
        </h4>
      ) : null}
      <ul>
        {links.map(link => (
          <li key={link.title}>
            <SidebarLink
              link={link}
              active={pathname === link.href}
              isCollapsed={isCollapsed}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

const SidebarLink = ({
  link,
  active,
  isCollapsed,
}: {
  link: SidebarLink;
  active: boolean;
  isCollapsed?: boolean;
}) => {
  return (
    <Link
      href={link.href}
      className={cn(
        'group transition-colors p-2 inline-block hover:bg-popover hover:text-primary text-muted-foreground text-xs hover:shadow rounded-md w-full',
        active ? 'text-primary font-semibold' : '',
        isCollapsed ? 'p-2' : 'p-2'
      )}
      title={isCollapsed ? link.title : undefined}
    >
      <div
        className={cn('flex items-center', isCollapsed ? 'justify-center' : '')}
      >
        <div
          className={cn(
            'opacity-0 left-0 h-6 w-[4px] absolute rounded-r-lg bg-primary',
            active ? 'opacity-100' : ''
          )}
        />
        <link.icon className={cn('h-3.5', isCollapsed ? '' : 'mr-1')} />
        {!isCollapsed && <span>{link.title}</span>}
      </div>
    </Link>
  );
};
