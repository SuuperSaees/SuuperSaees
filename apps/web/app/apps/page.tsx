import { PageBody } from '@kit/ui/page';
import { PageHeader } from '../components/page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import PluginCard from './components/plugin-card';
import PluginsHeaderCard from './components/plugins-header-card';
import { Separator } from '@kit/ui/separator';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('plugins:title'),
  };
};

function PluginsPage() {
  const plugins = ["loom", "treli", "stripe"];
  return (
    <PageBody>
      <div className="p-[35px]">
        <PageHeader title="plugins:title" />
        <PluginsHeaderCard />
        <Separator className="my-4" />
        <div className='flex flex-col gap-3'>
          {plugins.map((plugin) => (
            <PluginCard key={plugin} provider={plugin} mode={'settings'} />
          ))}
        </div>
      </div>
    </PageBody>
  );
}

export default PluginsPage;
