'use client';

import { useContext, useId, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { z } from 'zod';

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
import pathsConfig from '../../../../apps/web/config/paths.config';

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
  const className = getClassNameBuilder(props.className ?? '')({
    collapsed,
  });
  const ctx = {
    collapsed,
    setCollapsed,
    itemActiveStyle: props.itemActiveStyle,
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
  collapsed = false,
  collapsible = true,
  Icon,
  children,
}: React.PropsWithChildren<{
  label: string | React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  Icon?: React.ReactNode;
}>) {
  const { collapsed: sidebarCollapsed } = useContext(SidebarContext);
  const [isGroupCollapsed, setIsGroupCollapsed] = useState(collapsed);
  const id = useId();
  const Wrapper = () => {
    const className = cn('flex w-full text-md shadow-none', {
      'justify-between space-x-2.5': !sidebarCollapsed,
    });
    if (collapsible) {
      return (
        <Button
          aria-expanded={!isGroupCollapsed}
          aria-controls={id}
          onClick={() => setIsGroupCollapsed(!isGroupCollapsed)}
          className={className}
          variant="ghost"
          size="sm"
        >
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>{Icon}</TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
            <Trans i18nKey={label as string} defaults={label as string} />
          </div>
          <ChevronDown
            className={cn(`h-3 transition duration-300`, {
              'rotate-180': !isGroupCollapsed,
            })}
          />
        </Button>
      );
    }
    return (
      <div className={className}>
        <Trans i18nKey={label as string} defaults={label as string} />
      </div>
    );
  };
  return (
    <div className={'flex flex-col space-y-1 py-1'}>
      <Wrapper />
      <If condition={collapsible ? !isGroupCollapsed : true}>
        <div id={id} className={'px-6.5 flex flex-col space-y-1'}>
          {children}
        </div>
      </If>
    </div>
  );
}
export function SidebarDivider() {
  return (
    <div className={'dark:border-dark-800 my-2 border-t border-gray-100'} />
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
      className={cn(`text-md flex w-full shadow-none ${className}`, {
        'justify-start space-x-2.5': !collapsed,
      })}
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
        <span className={cn({ hidden: collapsed }, 'w-full flex items-center justify-between')}>{children}</span>
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

        if (item.label === 'common:catalogName' && !catalogProviderUrl && !catalogProductUrl) {
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
            >
              {item.children.map((child) => {
                if (
                  (child.label === 'common:catalogProviderName' && !catalogProviderUrl) ||
                  (child.label === 'common:catalogProductName' && !catalogProductUrl) ||
                  (child.label === 'common:toolCopyListName' && !toolCopyListUrl)
                ) {
                  return null;
                }
                return (
                  <SidebarItem
                    key={child.path}
                    end={child.end}
                    path={child.path}
                    Icon={child.Icon}
                  >
                    <Trans i18nKey={child.label} defaults={child.label} />
                  </SidebarItem>
                );
              })}
            </SidebarGroup>
          );
        }

        if (!showDashboardUrl && item.path === pathsConfig.app.dashboard) {
          return null
        }
        return (
          <SidebarItem
            key={item.path}
            end={item.end}
            path={item.path}
            Icon={item.Icon}
          >
            <Trans i18nKey={item.label} defaults={item.label} />
          </SidebarItem>
        );
      })}
    </>
  );
}