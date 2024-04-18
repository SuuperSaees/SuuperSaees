'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavigationMenuItem } from '@kit/ui/navigation-menu';
import { cn, isRouteActive } from '@kit/ui/utils';

const getClassName = (path: string, currentPathName: string) => {
  const isActive = isRouteActive(path, currentPathName);

  return cn(
    `text-sm font-medium px-2.5 py-2 border rounded-lg border-transparent transition-colors`,
    {
      'hover:border-border': !isActive,
      'dark:bg-secondary bg-gray-50': isActive,
    },
  );
};

export function SiteNavigationItem({
  path,
  children,
}: React.PropsWithChildren<{
  path: string;
}>) {
  const currentPathName = usePathname();

  return (
    <NavigationMenuItem key={path}>
      <Link className={getClassName(path, currentPathName)} href={path}>
        {children}
      </Link>
    </NavigationMenuItem>
  );
}
