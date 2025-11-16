'use client';

import { useSearchParams } from 'next/navigation';

import { useTranslation } from 'react-i18next';

import { Separator } from '@kit/ui/separator';

import LoomContent from './loom-content';
import SettingsHeaderCard from './settings-header-card';
import StripeContent from './stripe-content';
import TreliContent from './treli-content';
import EmbedsContent from './embed-content';
import SuuperApiContent from './suuper-content';
import CreditsContent from './credits-content';

function SettingsContent({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const name = searchParams.get('provider') ?? '';
  const pluginId = searchParams.get('pluginId') ?? '';
  const icon_url = searchParams.get('iconUrl') ?? ''; 

  const { t } = useTranslation('plugins');
  const normalizedProvider = name.toLowerCase();

  const components = {
    treli: TreliContent,
    loom: LoomContent,
    stripe: StripeContent,
    embeds: EmbedsContent,
    suuperapi: SuuperApiContent,
    credits: CreditsContent,
  };

  const PluginComponent =
    components[normalizedProvider as keyof typeof components];

  if (!PluginComponent) {
    return (
      <div>
        <p className="text-gray-500">{t('pluginNotFound')}</p>
      </div>
    );
  }

  return (
    <div>
      <SettingsHeaderCard name={name} pluginId={pluginId} icon_url={icon_url} />
      <div>
        <p className="text-lg font-semibold">
          {t(`${normalizedProvider}SettingsTitle`)}
        </p>
        <p className="text-sm text-gray-500">
          {t(`${normalizedProvider}SettingsDescription`)}
        </p>
      </div>
      <Separator className="my-4" />
      <PluginComponent pluginId={pluginId} userId={userId} />
    </div>
  );
}

export default SettingsContent;
