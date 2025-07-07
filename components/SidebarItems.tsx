'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { LucideIcon, ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { accountLinks, additionalLinks, defaultLinks } from '@/config/nav';

export interface SidebarLink {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: SidebarLink[];
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
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = link.children && link.children.length > 0;
  const fullPathname = usePathname();

  // Check if any child is active
  const isChildActive =
    hasChildren &&
    link.children?.some(child => fullPathname.startsWith(child.href));

  // Auto-expand if any child is active
  const shouldAutoExpand = isChildActive && !isCollapsed;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren && !isCollapsed) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <Link
        href={link.href}
        onClick={handleClick}
        className={cn(
          'group transition-colors p-2 inline-block hover:bg-popover hover:text-primary text-muted-foreground text-xs hover:shadow rounded-md w-full',
          active || isChildActive ? 'text-primary font-semibold' : '',
          isCollapsed ? 'p-2' : 'p-2'
        )}
        title={isCollapsed ? link.title : undefined}
      >
        <div
          className={cn(
            'flex items-center',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <div
            className={cn(
              'opacity-0 left-0 h-6 w-[4px] absolute rounded-r-lg bg-primary',
              active || isChildActive ? 'opacity-100' : ''
            )}
          />
          <link.icon className={cn('h-3.5', isCollapsed ? '' : 'mr-1')} />
          {!isCollapsed && (
            <>
              <span className="flex-1">{link.title}</span>
              {hasChildren && (
                <div className="ml-auto">
                  {isExpanded || shouldAutoExpand ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Link>

      {hasChildren && !isCollapsed && (isExpanded || shouldAutoExpand) && (
        <ul className="ml-4 mt-1 space-y-1">
          {link.children?.map(child => (
            <li key={child.title}>
              <Link
                href={child.href}
                className={cn(
                  'group transition-colors p-2 inline-block hover:bg-popover hover:text-primary text-muted-foreground text-xs hover:shadow rounded-md w-full',
                  fullPathname.startsWith(child.href)
                    ? 'text-primary font-semibold'
                    : ''
                )}
              >
                <div className="flex items-center">
                  <child.icon className="h-3.5 mr-1" />
                  <span>{child.title}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
