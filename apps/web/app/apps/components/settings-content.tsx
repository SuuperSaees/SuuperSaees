'use client';

import { useSearchParams } from "next/navigation";
import SettingsHeaderCard from "./settings-header-card";
import { useTranslation } from "react-i18next";
import LoomContent from "./loom-content";
import TreliContent from "./treli-content";
import StripeContent from "./stripe-content";
import { Separator } from "@kit/ui/separator";

function SettingsContent() {
  const provider = useSearchParams().get('provider');
  const { t } = useTranslation('plugins');

  const components = {
    treli: TreliContent,
    loom: LoomContent,
    stripe: StripeContent,
  };

  const PluginComponent = components[provider as keyof typeof components];

  return (
    <div>
      <SettingsHeaderCard provider={provider ?? ''} />
      <div>
        <p className="text-lg font-semibold">{t(`${provider}SettingsTitle`)}</p>
        <p className="text-sm text-gray-500">{t(`${provider}SettingsDescription`)}</p>
      </div>
      <Separator className="my-4" />
      <PluginComponent />
    </div>
  );
}

export default SettingsContent;