'use client';

import { useRouter } from 'next/navigation';

import { Download, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { Switch } from '@kit/ui/switch';

interface AppCardProps {
  provider: string;
  mode: 'install' | 'settings';
}

export default function PluginCard({ provider, mode }: AppCardProps) {
  const { t } = useTranslation('plugins');
  const router = useRouter();
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* App Icon */}
        <div className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl">
            <img
              src={`/images/plugins/${provider}.png`}
              alt={`${provider} icon`}
              className="h-10 w-10"
            />
          </div>
        </div>

        {/* App Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-medium">{t(`${provider}Title`)}</h3>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('freeInstall')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(`${provider}Description`)}
          </p>
        </div>

        {/* Controls */}

        {mode == 'settings' ? (
          <div className="flex items-center gap-2 self-center">
            <Switch className="data-[state=checked]:bg-BlueDark-700" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                router.push(`/apps/settings?provider=${provider}`);
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant='ghost' size='icon'>
            <Download className="h-6 w-6 text-gray-600" />
          </Button>
        )}
      </div>
    </Card>
  );
}
