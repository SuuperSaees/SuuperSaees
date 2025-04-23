'use client';

import { useContext, useEffect, useId, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { z } from 'zod';

import pathsConfig from '../../../../apps/web/config/paths.config';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../shadcn/tooltip';
import { cn, isRouteActive } from '../utils';
import { SidebarContext } from './context/sidebar.context';
import { NavigationConfigSchema } from './navigation-config.schema';
import { Trans } from './trans';

export const getColorLuminance = (
  hexColor: string,
): { luminance: number; theme: 'light' | 'dark' } => {
  const color = hexColor.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate the luminance value
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Determine the theme based on the luminance value
  const theme = luminance > 186 ? 'light' : 'dark';

  // Return an object with luminance and theme properties
  return { luminance, theme };
};
// Define a better type for the group children to avoid any
export type SidebarGroupChild = {
  label: string;
  path: string;
  Icon: React.ReactNode;
  end?: boolean | ((path: string) => boolean);
  className?: string;
  menu?: React.ReactNode;
};

export type SidebarGroup = {
  type: 'group';
  path?: string;
  label: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  Icon?: React.ReactNode;
  className?: string;
  menu?: React.ReactNode;
  children: SidebarGroupChild[];
};

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
  style?: React.CSSProperties;
  itemActiveStyle?: React.CSSProperties;
  itemHoverStyle?: React.CSSProperties;
  sidebarColor?: string;
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
    itemHoverStyle: props.itemHoverStyle,
    openGroupId,
    setOpenGroupId,
    sidebarColor: props.sidebarColor ?? '#ffffff',
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
    <div className={cn('flex w-full flex-col px-4', className)}>
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
    itemActiveStyle,
    itemHoverStyle,
  } = useContext(SidebarContext);
  const id = useId();
  const pathname = usePathname();
  const isGroupOpen = openGroupId === id;
  const active = isRouteActive(pathname, path ?? '', true);
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
    'flex w-full text-md shadow-none group/sidebar-group relative gap-2 rounded-md py-1 items-center  ',
    {
      'w-full px-3': !sidebarCollapsed,
    },
    className,
  );

  // Render the icon if provided
  const iconElement = Icon && (
    <div
      className={cn('block flex h-5 w-5 shrink-0 items-center justify-center', {
        'group-hover/sidebar-group:hidden': collapsible,
      })}
    >
      {Icon}
    </div>
  );

  // Render the menu if provided
  const menuElement = menu && (
    <div className="invisible ml-auto flex shrink-0 items-center justify-center group-hover/sidebar-group:visible">
      {menu}
    </div>
  );

  // Render the chevron for collapsible groups
  const chevronElement = collapsible && (
    <button
      aria-expanded={isGroupOpen}
      aria-controls={id}
      onClick={toggleGroup}
      className="hidden h-5 w-5 shrink-0 items-center justify-center p-0 group-hover/sidebar-group:flex bg-transparent hover:bg-transparent yo"
    >
      <ChevronDown
        className={cn('block h-3 w-3', {
          'rotate-180': isGroupOpen,
        })}
      />
    </button>
  );

  // Render the label content, either as a link or plain text
  const labelElement = path ? (
    <Link
      href={path}
      className={cn('line-clamp-1 w-full font-normal ', {
        'font-normal': isRouteActive(pathname, path, true),
      })}
      onClick={collapsible ? (e) => e.stopPropagation() : undefined}
    >
      {labelContent}
    </Link>
  ) : (
    <span className="line-clamp-1">{labelContent}</span>
  );

  return (
    <div className={cn('flex flex-col rounded-md ', className)}>
      <div
        className={wrapperClassName}
        onClick={collapsible && !path ? toggleGroup : undefined}
        style={active && itemActiveStyle ? itemActiveStyle : undefined}
        onMouseEnter={(e) => {
          if (itemHoverStyle) {
            e.currentTarget.style.backgroundColor =
              itemHoverStyle.backgroundColor as string;
            e.currentTarget.style.color = itemHoverStyle.color as string;
          }
        }}
        onMouseLeave={(e) => {
          if (itemHoverStyle) {
            // If the item is active, restore the active style
            if (active && itemActiveStyle) {
              e.currentTarget.style.backgroundColor =
                itemActiveStyle.backgroundColor as string;
              e.currentTarget.style.color = itemActiveStyle.color as string;
            } else {
              // Otherwise, clear the styles
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.color = '';
            }
          }
        }}
      >
        {chevronElement}
        {iconElement}
        {labelElement}
        {menuElement}
      </div>

      {/* Render children if not collapsible or if group is open */}
      {(!collapsible || isGroupOpen) && (
        <div id={id} className="flex flex-col overflow-y-auto pl-3">
          {children}
        </div>
      )}
    </div>
  );
}
export function SidebarDivider() {
  return <div className="my-2 h-px bg-border" />;
}

// Update type to be more flexible with record structure
type FlexibleGroup = {
  label?: React.ReactNode;
  path?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  Icon?: React.ReactNode;
  className?: string;
  menu?: React.ReactNode;
  children?: Array<{
    label?: string;
    path?: string;
    Icon?: React.ReactNode;
    end?: boolean | ((path: string) => boolean);
    className?: string;
    menu?: React.ReactNode;
  }>;
};

export function SidebarSection({
  label,
  path,
  children,
  className,
  menu,
  groups,
}: React.PropsWithChildren<{
  label: string | React.ReactNode;
  path?: string;
  className?: string;
  menu?: React.ReactNode;
  groups?: FlexibleGroup[];
}>) {
  const { collapsed, itemActiveStyle, itemHoverStyle } =
    useContext(SidebarContext);
  const currentPath = usePathname() ?? '';
  const active = isRouteActive(path ?? '', currentPath, true);
  // Add additional error handling for debugging
  const safeGroups = Array.isArray(groups) ? groups : [];

  const SectionHeader = () => {
    if (path) {
      return (
        <div
          className="group/sidebar-section flex items-center justify-between rounded-md px-3 py-2 opacity-100 font-semibold opacity-70"
          style={active && itemActiveStyle ? itemActiveStyle : undefined}
          onMouseEnter={(e) => {
            if (itemHoverStyle) {
              e.currentTarget.style.backgroundColor =
                itemHoverStyle.backgroundColor as string;
              e.currentTarget.style.color = itemHoverStyle.color as string;
            }
          }}
          onMouseLeave={(e) => {
            if (itemHoverStyle) {
              // If the item is active, restore the active style
              if (active && itemActiveStyle) {
                e.currentTarget.style.backgroundColor =
                  itemActiveStyle.backgroundColor as string;
                e.currentTarget.style.color = itemActiveStyle.color as string;
              } else {
                // Otherwise, clear the styles
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = '';
              }
            }
          }}
        >
          <Link
            href={path}
            className="h-fit w-fit w-full rounded-md"
          >
            <h3
              className={cn(
                'text-xs',
                className,
              )}

            >
              <Trans i18nKey={label as string} defaults={label as string} />
            </h3>
          </Link>
          <div className="invisible flex shrink-0 items-center justify-center group-hover/sidebar-section:visible">
            {menu}
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between px-3 py-2 opacity-70">
        <h3
          className={cn('text-xs font-semibold', className)}
        >
          <Trans i18nKey={label as string} defaults={label as string} />
        </h3>
        <div className="invisible flex shrink-0 items-center justify-center group-hover/sidebar-section:visible">
          {menu}
        </div>
      </div>
    );
  };

  const renderGroups = (groupsList: FlexibleGroup[]) => {
    return groupsList.map((group, index) => {
      // Skip if group doesn't have required properties
      if (!group?.label) return null;

      return (
        <SidebarGroup
          key={`group-${index}`}
          label={group.label}
          collapsible={group.collapsible}
          collapsed={group.collapsed}
          Icon={group.Icon}
          className={group.className}
          path={group.path}
          menu={group.menu}
        >
          {Array.isArray(group.children)
            ? group.children.map((child, childIndex) => {
                // Skip if child doesn't have required properties
                if (!child?.path) return null;

                return (
                  <SidebarItem
                    key={`${child.path}-${childIndex}`}
                    end={child.end}
                    path={child.path}
                    Icon={child.Icon ?? <span />}
                    className={child.className}
                    menu={child.menu}
                  >
                    <Trans
                      i18nKey={child.label}
                      defaults={child.label ?? 'Unnamed'}
                    />
                  </SidebarItem>
                );
              })
            : null}
        </SidebarGroup>
      );
    });
  };

  if (collapsed) {
    return safeGroups.length > 0 ? (
      <>{renderGroups(safeGroups)}</>
    ) : (
      <>{children}</>
    );
  }

  return (
    <div
      className={cn(
        'mt-4 flex flex-col',
        className,
      )}
    >
      <SectionHeader />
      <div className="scrollbar-on-hover flex-col overflow-y-auto">
        {safeGroups.length > 0 ? renderGroups(safeGroups) : null}
   
          {children}
    
      </div>
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
  const { collapsed, itemActiveStyle, itemHoverStyle } =
    useContext(SidebarContext);
  const currentPath = usePathname() ?? '';
  const active = isRouteActive(path, currentPath, end ?? false);

  const buttonContent = (
    <>
      {collapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild className="shrink-0">
              {Icon}
            </TooltipTrigger>
            <TooltipContent side={'right'} sideOffset={20}>
              {children}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            {Icon}
          </span>
          <span className="line-clamp-1 w-full font-normal text-left">{children}</span>
        </>
      )}
    </>
  );

  return (
    <div
      className="group/sidebar-item flex w-full items-center rounded-md"
      style={active && itemActiveStyle ? itemActiveStyle : undefined}
      onMouseEnter={(e) => {
        if (itemHoverStyle) {
          e.currentTarget.style.backgroundColor =
            itemHoverStyle.backgroundColor as string;
          e.currentTarget.style.color = itemHoverStyle.color as string;
        }
      }}
      onMouseLeave={(e) => {
        if (itemHoverStyle) {
          // If the item is active, restore the active style
          if (active && itemActiveStyle) {
            e.currentTarget.style.backgroundColor =
              itemActiveStyle.backgroundColor as string;
            e.currentTarget.style.color = itemActiveStyle.color as string;
          } else {
            // Otherwise, clear the styles
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.color = '';
          }
        }
      }}
    >
      <button
        className={cn(
          'text-md flex w-full bg-transparent shadow-none hover:bg-transparent',
          {
            'justify-start px-3 py-1.5': !collapsed,
          },
          className,
        )}
      >
        <Link
          key={path}
          href={path}
          className="flex w-full  items-center gap-2 font-normal line-clamp-1"
        >
          {buttonContent}
        </Link>
      </button>
      {!collapsed && menu && (
        <div className="invisible flex shrink-0 items-center justify-center px-3 group-hover/sidebar-item:visible">
          {menu}
        </div>
      )}
    </div>
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
          false: `w-2/12 lg:w-[260px]`,
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
              className={item.className}
              menu={item.menu}
              groups={item.groups}
            />
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
              menu={item.menu}
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
                    menu={child.menu}
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
            menu={item.menu}
          >
            <Trans i18nKey={item.label} defaults={item.label} />
          </SidebarItem>
        );
      })}
    </>
  );
}
