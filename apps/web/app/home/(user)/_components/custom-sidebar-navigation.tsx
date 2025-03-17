'use client';

import { SidebarDivider, SidebarGroup, SidebarItem, SidebarSection } from '@kit/ui/sidebar';
import { Trans } from '@kit/ui/trans';

import { MessageBadge } from './message-badge';
import { NavigationConfigSchema } from '@kit/ui/navigation-schema';
import { z } from 'zod';
import pathsConfig from '~/config/paths.config';

type NavigationConfig = z.infer<typeof NavigationConfigSchema>;

export function CustomSidebarNavigation({
  config,
  showDashboardUrl,
  catalogProviderUrl,
  catalogProductUrl,
  toolCopyListUrl,
  userId,
}: React.PropsWithChildren<{
  config: NavigationConfig;
  showDashboardUrl?: boolean;
  catalogProviderUrl?: boolean;
  catalogProductUrl?: boolean;
  toolCopyListUrl?: boolean;
  userId?: string;
}>) {
  console.log('config', config)
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
                  key={typeof item.label === 'string' ? item.label + index : index + ''}
                />
              }
              path={item.path}
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
                  key={typeof item.label === 'string' ? item.label + index : index + ''}
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

        // Add MessageBadge to the "/messages" navigation item
        if (item.path === pathsConfig.app.messages) {
          return (
            <SidebarItem
              key={item.path}
              end={item.end}
              path={item.path}
              Icon={item.Icon}
              className="flex w-full items-center justify-between"
              menu={item.menu}
            >
              <Trans i18nKey={item.label} defaults={item.label} />
              <MessageBadge userId={userId ?? ''} />
            </SidebarItem>
          );
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
