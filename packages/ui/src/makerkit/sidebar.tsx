'use client';

import { useContext, useEffect, useId, useState } from 'react';

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
  menu,
}: React.PropsWithChildren<{
  label: string | React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  Icon?: React.ReactNode;
  className?: string;
  path?: string;
  menu?: React.ReactNode;
}>) {
  const {
    collapsed: sidebarCollapsed,
    openGroupId,
    setOpenGroupId,
  } = useContext(SidebarContext);
  const id = useId();
  const pathname = usePathname();
  const isGroupOpen = openGroupId === id;

  // Initialize group state on mount
  useEffect(() => {
    if (!collapsed && collapsible) {
      setOpenGroupId(id);
    }
  }, [collapsed, collapsible, id, setOpenGroupId]);

  // Toggle group open/closed
  const toggleGroup = () => {
    setOpenGroupId(isGroupOpen ? null : id);
  };

  // Prepare the label content
  const labelContent =
    typeof label === 'string' ? (
      <Trans i18nKey={label} defaults={label} />
    ) : (
      label
    );

  // Common wrapper class names
  const wrapperClassName = cn(
    'flex w-full text-md shadow-none group/sidebar-group relative gap-2',
    {
      'w-full px-3': !sidebarCollapsed,
    },
    className,
  );

  // Render the icon if provided
  const iconElement = Icon && (
    <div className="block flex h-5 w-5 items-center justify-center group-hover/sidebar-group:hidden">
      {Icon}
    </div>
  );

  // Render the menu if provided
  const menuElement = menu && (
    <div className="ml-auto flex items-center justify-center">{menu}</div>
  );

  // Render the chevron for collapsible groups
  const chevronElement = collapsible && (
    <Button
      aria-expanded={isGroupOpen}
      aria-controls={id}
      onClick={toggleGroup}
      className="hidden h-5 w-5 items-center justify-center p-0 group-hover/sidebar-group:flex"
      variant="ghost"
      size="sm"
    >
      <ChevronDown
        className={cn('block h-3 w-3 transition duration-300', {
          'rotate-180': isGroupOpen,
        })}
      />
    </Button>
  );

  // Render the label content, either as a link or plain text
  const labelElement = path ? (
    <Link
      href={path}
      className={cn('flex items-center transition-colors', {
        'font-medium': isRouteActive(pathname, path, true),
      })}
      onClick={collapsible ? (e) => e.stopPropagation() : undefined}
    >
      {labelContent}
    </Link>
  ) : (
    <span>{labelContent}</span>
  );

  return (
    <div className={cn('flex flex-col space-y-1 py-1', className)}>
      <div
        className={wrapperClassName}
        onClick={collapsible && !path ? toggleGroup : undefined}
      >
        {chevronElement}
        {iconElement}
        {labelElement}
        {menuElement}
      </div>

      {/* Render children if not collapsible or if group is open */}
      {(!collapsible || isGroupOpen) && (
        <div id={id} className="pl-7 flex flex-col space-y-1">
          {children}
        </div>
      )}
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
  menu,
}: React.PropsWithChildren<{
  label: string | React.ReactNode;
  path?: string;
  className?: string;
  menu?: React.ReactNode;
}>) {
  const { collapsed } = useContext(SidebarContext);

  const SectionHeader = () => {
    if (path) {
      return (
        <div className="mt-4 flex items-center justify-between px-3">
          <Link href={path} className="h-fit w-fit">
            <h3 className="text-xs font-medium text-muted-foreground">
              <Trans i18nKey={label as string} defaults={label as string} />
            </h3>
          </Link>
          {menu}
        </div>
      );
    }

    return (
      <div className="mt-4 flex justify-between px-3">
        <h3 className="text-xs font-medium text-muted-foreground">
          <Trans i18nKey={label as string} defaults={label as string} />
        </h3>
        {menu}
      </div>
    );
  };

  if (collapsed) {
    return <>{children}</>;
  }

  return (
    <div className={cn('mt-4', className)}>
      <SectionHeader />
      <div className="flex space-y-1">{children}</div>
    </div>
  );
}
export function SidebarItem({
  end,
  path,
  children,
  Icon,
  className,
  menu,
}: React.PropsWithChildren<{
  path: string;
  Icon: React.ReactNode;
  end?: boolean | ((path: string) => boolean);
  className?: string;
  menu?: React.ReactNode;
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
          'justify-start gap-3 px-3': !collapsed,
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
          {!collapsed && menu && (
            <span className="ml-auto flex items-center justify-center">
              {menu}
            </span>
          )}
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
                  i18nKey={typeof item.label === 'string' ? item.label : ''}
                  defaults={typeof item.label === 'string' ? item.label : ''}
                  key={
                    typeof item.label === 'string'
                      ? item.label + index
                      : index + ''
                  }
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
              key={typeof item.label === 'string' ? item.label : ''}
              label={
                <Trans
                  i18nKey={typeof item.label === 'string' ? item.label : ''}
                  defaults={typeof item.label === 'string' ? item.label : ''}
                  key={
                    typeof item.label === 'string'
                      ? item.label + index
                      : index + ''
                  }
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
