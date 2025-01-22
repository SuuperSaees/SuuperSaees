import { PageBody } from '@kit/ui/page';
import { Separator } from '@kit/ui/separator';

import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { getAccountPluginsByAccountAction } from '../../../../packages/plugins/src/server/actions/account-plugins/get-account-plugins-by-account';
import { getAllPluginsAction } from '../../../../packages/plugins/src/server/actions/plugins/get-all-plugins';
import { PageHeader } from '../components/page-header';
import PluginCard from './components/plugin-card';
import PluginsHeaderCard from './components/plugins-header-card';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('plugins:title'),
  };
};

interface EnrichedPlugin {
  id: string;
  name: string;
  description: string; 
  type: 'integration' | 'tool' | 'internal' | 'external';
  created_at: string;
  updated_at: string;
  icon_url?: string | null;
  status: 'installed' | 'uninstalled' | 'failed' | 'in progress';
  pluginId?: string;
}

async function PluginsPage() {
  const { user } = await loadUserWorkspace();
  const userId: string = user.id;

  const allPluginsResponse = await getAllPluginsAction();
  const allPlugins = allPluginsResponse.success?.data ?? [];

  const accountPluginsResponse = await getAccountPluginsByAccountAction(
    userId,
    100,
    0,
  );
  const accountPlugins = accountPluginsResponse.success?.data ?? [];

  const enrichedPlugins: EnrichedPlugin[] = allPlugins.map((plugin) => {
    const accountPlugin = accountPlugins.find(
      (ap) => ap.plugin_id === plugin.id,
    );
    return {
      id: plugin.id,
      name: plugin.name || 'Unknown', 
      description: plugin.description ?? '', 
      type: plugin.type,
      created_at: plugin.created_at,
      updated_at: plugin.updated_at,
      icon_url: plugin.icon_url ?? null,
      status: accountPlugin?.status ?? 'uninstalled',
      pluginId: accountPlugin?.id,
    };
  });

  const installedPlugins: EnrichedPlugin[] = accountPlugins
    .filter((ap) => ap.deleted_on === null)
    .map((ap) => {
      const plugin = allPlugins.find((p) => p.id === ap.plugin_id);
      if (plugin) {
        return {
          id: plugin.id,
          name: plugin.name || 'Unknown',
          description: plugin.description ?? '',
          type: plugin.type,
          created_at: plugin.created_at,
          updated_at: plugin.updated_at,
          icon_url: plugin.icon_url ?? null,
          status: ap.status,
          pluginId: ap.id,
        };
      }
      throw new Error(`Plugin ID ${ap.plugin_id} not found in allPlugins`);
    });

  return (
    <PageBody>
      <div className="p-[35px]">
        <PageHeader title="plugins:title" />
        <PluginsHeaderCard plugins={enrichedPlugins} />
        <Separator className="my-4" />
        <div className="flex flex-col gap-3">
          {installedPlugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              id={plugin.id}
              pluginId={plugin.pluginId}
              name={plugin.name}
              status={plugin.status}
              icon_url={plugin.icon_url}
              mode="settings"
            />
          ))}
        </div>
      </div>
    </PageBody>
  );
}

export default withI18n(PluginsPage);
