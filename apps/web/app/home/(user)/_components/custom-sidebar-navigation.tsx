import { SidebarDivider, SidebarGroup, SidebarItem } from '@kit/ui/sidebar';
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
  return (
    <>
      {config.routes.map((item, index) => {
        if ('divider' in item) {
          return <SidebarDivider key={index} />;
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
            >
              <div className="flex items-center">
                <Trans i18nKey={item.label} defaults={item.label} />
                <MessageBadge userId={userId ?? ''} />
              </div>
            </SidebarItem>
          );
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
