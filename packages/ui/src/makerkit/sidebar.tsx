'use client';

import { useContext, useId, useState, useEffect } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { z } from 'zod';

import pathsConfig from '../../../../apps/web/config/paths.config';
import { Button } from '../shadcn/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../shadcn/tooltip';
import { cn, isRouteActive } from '../utils';
import { SidebarContext } from './context/sidebar.context';
import { If } from './if';
import { NavigationConfigSchema } from './navigation-config.schema';
import { Trans } from './trans';

export type SidebarConfig = z.infer<typeof NavigationConfigSchema>;
export function Sidebar(props: {
  collapsed?: boolean;
  className?: string;
  children:
    | React.ReactNode
    | ((props: {
        collapsed: boolean;
        setCollapsed: (collapsed: boolean) => void;
      }) => React.ReactNode);
  style?: React.CSSProperties; // Adding style prop explicitly
  itemActiveStyle?: React.CSSProperties;
}) {
  const [collapsed, setCollapsed] = useState(props.collapsed ?? false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  
  const className = getClassNameBuilder(props.className ?? '')({
    collapsed,
  });
  
  const ctx = {
    collapsed,
    setCollapsed,
    itemActiveStyle: props.itemActiveStyle,
    openGroupId,
    setOpenGroupId,
  };
  
  return (
    <SidebarContext.Provider value={ctx}>
      <div className={className} style={props.style}>
        {typeof props.children === 'function'
          ? props.children(ctx)
          : props.children}
      </div>
    </SidebarContext.Provider>
  );
}
export function SidebarContent({
  children,
  className,
}: React.PropsWithChildren<{
  className?: string;
}>) {
  return (
    <div className={cn('flex w-full flex-col space-y-1 px-4', className)}>
      {children}
    </div>
  );
}
export function SidebarGroup({
  label,
  collapsible = true,
  collapsed = false,
  Icon,
  children,
  className,
  path,
}: React.PropsWithChildren<{
  label: string | React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  Icon?: React.ReactNode;
  className?: string;
  path?: string;
}>) {
  const { collapsed: sidebarCollapsed, openGroupId, setOpenGroupId } = useContext(SidebarContext);
  const id = useId();
  const pathname = usePathname();
  
  // Initialize the openGroupId based on the collapsed prop
  // This effect runs once on mount to set the initial state
  useEffect(() => {
    if (!collapsed && collapsible) {
      setOpenGroupId(id);
    }
  }, [collapsed, collapsible, id, setOpenGroupId]);
  
  // Determine if this group is open based on the shared openGroupId state
  const isGroupOpen = openGroupId === id;
  
  // Handle toggling this group
  const toggleGroup = () => {
    if (isGroupOpen) {
      // If this group is already open, close it
      setOpenGroupId(null);
    } else {
      // Otherwise, open this group and close any other open group
      setOpenGroupId(id);
    }
  };

  const labelContent = (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{Icon}</TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
      <Trans i18nKey={label as string} defaults={label as string} />
    </div>
  );

  const Wrapper = () => {
    const wrapperClassName = cn(
      'flex w-full text-md shadow-none',
      {
        'justify-between space-x-2.5': !sidebarCollapsed,
      },
      className,
    );

    if (collapsible) {
      // Collapsible group
      if (path) {
        // Collapsible with path - render a button with a link inside for the label
        return (
          <div className={wrapperClassName}>
            <Link
              href={path}
              className={cn(
                'flex items-center decoration-transparent transition-colors hover:underline hover:decoration-gray-400 px-2',
                {
                  'font-medium': isRouteActive(pathname, path, true),
                },
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {labelContent}
            </Link>
            <Button
              aria-expanded={isGroupOpen}
              aria-controls={id}
              onClick={toggleGroup}
              className="px-3"
              variant="ghost"
              size="sm"
            >
              <ChevronDown
                className={cn(`h-3 transition duration-300`, {
                  'rotate-180': isGroupOpen,
                })}
              />
            </Button>
          </div>
        );
      } else {
        // Collapsible without path - standard button behavior
        return (
          <Button
            aria-expanded={isGroupOpen}
            aria-controls={id}
            onClick={toggleGroup}
            className={wrapperClassName}
            variant="ghost"
            size="sm"
          >
            {labelContent}
            <ChevronDown
              className={cn(`h-3 transition duration-300`, {
                'rotate-180': isGroupOpen,
              })}
            />
          </Button>
        );
      }
    } else {
      // Not collapsible
      if (path) {
        // Not collapsible with path - render as a link
        return (
          <Link
            href={path}
            className={cn(wrapperClassName, 'hover:underline', {
              'font-medium': isRouteActive(pathname, path, true),
            })}
          >
            {labelContent}
          </Link>
        );
      } else {
        // Not collapsible without path - render as a div (current behavior)
        return <div className={wrapperClassName}>{labelContent}</div>;
      }
    }
  };

  return (
    <div className={cn('flex flex-col space-y-1 py-1', className)}>
      <Wrapper />
      <If condition={collapsible ? isGroupOpen : true}>
        <div id={id} className={'px-6.5 flex flex-col space-y-1'}>
          {children}
        </div>
      </If>
    </div>
  );
}
export function SidebarDivider() {
  return <div className="my-2 h-px bg-border" />;
}
export function SidebarSection({
  label,
  path,
  children,
  className,
}: React.PropsWithChildren<{
  label: string | React.ReactNode;
  path?: string;
  className?: string;
}>) {
  const { collapsed } = useContext(SidebarContext);

  const SectionHeader = () => {
    if (path) {
      return (
        <Link href={path} className="block">
          <div className="mb-2 mt-4 px-3 transition-colors hover:text-primary">
            <h3 className="text-xs font-medium text-muted-foreground">
              <Trans i18nKey={label as string} defaults={label as string} />
            </h3>
          </div>
        </Link>
      );
    }

    return (
      <div className="mb-2 mt-4 px-3">
        <h3 className="text-xs font-medium text-muted-foreground">
          <Trans i18nKey={label as string} defaults={label as string} />
        </h3>
      </div>
    );
  };

  if (collapsed) {
    return <>{children}</>;
  }

  return (
    <div className={cn('mt-4', className)}>
      <SectionHeader />
      <div className="space-y-1">{children}</div>
    </div>
  );
}
export function SidebarItem({
  end,
  path,
  children,
  Icon,
  className,
}: React.PropsWithChildren<{
  path: string;
  Icon: React.ReactNode;
  end?: boolean | ((path: string) => boolean);
  className?: string;
}>) {
  const { collapsed, itemActiveStyle } = useContext(SidebarContext);
  const currentPath = usePathname() ?? '';
  const active = isRouteActive(path, currentPath, end ?? false);
  const variant = active ? 'secondary' : 'ghost';
  const size = collapsed ? 'icon' : 'sm';
  return (
    <Button
      asChild
      className={cn(
        `text-md flex w-full shadow-none`,
        {
          'justify-start space-x-2.5': !collapsed,
        },
        className,
      )}
      size={size}
      variant={variant}
      style={active && itemActiveStyle ? itemActiveStyle : undefined}
    >
      <Link key={path} href={path}>
        <If condition={collapsed} fallback={Icon}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{Icon}</TooltipTrigger>
              <TooltipContent side={'right'} sideOffset={20}>
                {children}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </If>
        <span
          className={cn(
            { hidden: collapsed },
            'flex w-full items-center justify-between',
          )}
        >
          {children}
        </span>
      </Link>
    </Button>
  );
}
function getClassNameBuilder(className: string) {
  return cva(
    [
      cn(
        'flex box-content h-screen flex-col relative shadow-sm border-r',
        className,
      ),
    ],
    {
      variants: {
        collapsed: {
          true: `w-[6rem]`,
          false: `w-2/12 lg:w-[17rem]`,
        },
      },
    },
  );
}
export function SidebarNavigation({
  config,
  showDashboardUrl,
  catalogProviderUrl,
  catalogProductUrl,
  toolCopyListUrl,
}: React.PropsWithChildren<{
  config: SidebarConfig;
  showDashboardUrl?: boolean;
  catalogProviderUrl?: boolean;
  catalogProductUrl?: boolean;
  toolCopyListUrl?: boolean;
}>) {
  return (
    <>
      {config.routes.map((item, index) => {
        if ('divider' in item) {
          return <SidebarDivider key={index} />;
        }

        if ('section' in item) {
          return (
            <SidebarSection
              key={`section-${index}`}
              label={
                <Trans
                  i18nKey={item.label}
                  defaults={item.label}
                  key={item.label + index}
                />
              }
              path={item.path}
            >
              {item.items.map((child) => (
                <SidebarItem
                  key={child.path}
                  end={child.end}
                  path={child.path}
                  Icon={child.Icon}
                  className={child.className}
                >
                  <Trans i18nKey={child.label} defaults={child.label} />
                </SidebarItem>
              ))}
            </SidebarSection>
          );
        }

        if (
          item.label === 'common:catalogName' &&
          !catalogProviderUrl &&
          !catalogProductUrl
        ) {
          return null;
        } else if (item.label === 'common:aiToolsName' && !toolCopyListUrl) {
          return null;
        } else if ('children' in item) {
          return (
            <SidebarGroup
              key={item.label}
              label={
                <Trans
                  i18nKey={item.label}
                  defaults={item.label}
                  key={item.label + index}
                />
              }
              collapsible={item.collapsible}
              collapsed={item.collapsed}
              Icon={item.Icon}
              className={item.className}
              path={item.path}
            >
              {item.children.map((child) => {
                if (
                  (child.label === 'common:catalogProviderName' &&
                    !catalogProviderUrl) ||
                  (child.label === 'common:catalogProductName' &&
                    !catalogProductUrl) ||
                  (child.label === 'common:toolCopyListName' &&
                    !toolCopyListUrl)
                ) {
                  return null;
                }
                return (
                  <SidebarItem
                    key={child.path}
                    end={child.end}
                    path={child.path}
                    Icon={child.Icon}
                    className={child.className}
                  >
                    <Trans i18nKey={child.label} defaults={child.label} />
                  </SidebarItem>
                );
              })}
            </SidebarGroup>
          );
        }

        if (!showDashboardUrl && item.path === pathsConfig.app.dashboard) {
          return null;
        }

        return (
          <SidebarItem
            key={item.path}
            end={item.end}
            path={item.path}
            Icon={item.Icon}
            className={item.className}
          >
            <Trans i18nKey={item.label} defaults={item.label} />
          </SidebarItem>
        );
      })}
    </>
  );
}
