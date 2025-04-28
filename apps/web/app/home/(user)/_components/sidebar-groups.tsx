'use client';

import { SidebarGroup, SidebarItem } from '@kit/ui/sidebar';
import { Trans } from '@kit/ui/trans';

export function SidebarGroups({
  label,
  Icon,
  groups,
  className,
  showCatalogProviderUrl,
  showCatalogProductWholesaleUrl,
  showCatalogProductPrivateLabelUrl,
  showCatalogSourcingChinaUrl,
}: {
  label: string;
  path: string;
  Icon: React.ReactNode;
  collapsed?: boolean;
  groups: {
    type: 'group' | 'route';
    end?: boolean;
    label: string;
    path: string;
    Icon: React.ReactNode;
    collapsible: boolean;
    collapsed: boolean;
    className: string;
    menu: React.ReactNode;
    children: {
      type: 'group' | 'route';
      label: string;
      path: string;
      Icon: React.ReactNode;
      end: boolean;
      className: string;
      menu: React.ReactNode;
    }[];
  }[];
  className?: string;
  menu?: React.ReactNode;
  showCatalogProviderUrl?: boolean;
  showCatalogProductUrl?: boolean;
  showCatalogProductWholesaleUrl?: boolean;
  showCatalogProductPrivateLabelUrl?: boolean;
  showCatalogSourcingChinaUrl?: boolean;
}) {
  return (
    <div className={`sidebar-groups ${className ?? ''}`}>
      <div className="sidebar-groups-header flex items-center gap-2 px-3 py-2">
        {Icon}
        <Trans i18nKey={label} defaults={label} />
      </div>
      <div className="sidebar-groups-content pl-4">
        {groups.map((group, index) => {
          if (group.type === 'group') {
            // Filtrar elementos hijos según las flags
            const filteredChildren = group.children.filter((child: { label: string; type: string; }) => {
              if (
                (child.label === 'common:catalogWholesaleName' && !showCatalogProductWholesaleUrl) ||
                (child.label === 'common:catalogPrivateLabelName' && !showCatalogProductPrivateLabelUrl)
              ) {
                return false;
              }
              return true;
            });

            if (filteredChildren.length === 0) {
              return null;
            }

            return (
              <SidebarGroup
                key={index}
                label={
                  <Trans
                    i18nKey={group.label}
                    defaults={group.label}
                  />
                }
                collapsible={group.collapsible}
                collapsed={group.collapsed}
                Icon={group.Icon}
                path={group.path}
                className={group.className}
                menu={group.menu}
              >
                {filteredChildren.map((child: {
                  label: string;
                  path: string;
                  Icon: React.ReactNode;
                  end: boolean;
                  className: string;
                  menu: React.ReactNode;
                }, childIndex: number) => (
                  <SidebarItem
                    key={`${child.path}-${childIndex}`}
                    path={child.path ?? ''}
                    Icon={child.Icon}
                    className={child.className}
                    menu={child.menu}
                    end={child.end}
                  >
                    <Trans i18nKey={child.label} defaults={child.label} />
                  </SidebarItem>
                ))}
              </SidebarGroup>
            );
          } else if (group.type === 'route') {
            // Verificar si debemos mostrar esta ruta
            if (
              (group.label === 'common:catalogProviderName' && !showCatalogProviderUrl) ||
              (group.label === 'common:catalogSourcingChinaName' && !showCatalogSourcingChinaUrl)
            ) {
              return null;
            }

            return (
              <SidebarItem
                key={`${group.path}-${index}`}
                path={group.path}
                Icon={group.Icon}
                className={group.className}
                menu={group.menu}
                end={group.end}
              >
                <Trans i18nKey={group.label} defaults={group.label} />
              </SidebarItem>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
} 