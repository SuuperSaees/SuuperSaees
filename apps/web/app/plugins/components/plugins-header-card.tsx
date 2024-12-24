'use client';

import { ChevronRight, Rocket } from 'lucide-react';

import { Card } from '@kit/ui/card';
import { useTranslation } from 'react-i18next';

function PluginsHeaderCard() {
  const { t } = useTranslation('plugins');
  return (
    <Card className="group transition-colors border border-BlueDark-600 shadow-md">
      <div className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-BlueDark-600 bg-BlueDark-600/15 text-blue-500">
          <Rocket className="h-5 w-5 text-BlueDark-600" strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-blue-700">{t('headerTitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('headerDescription')}
          </p>
        </div>

        <ChevronRight className="h-6 w-6 text-muted-foreground transition-colors" />
      </div>
    </Card>
  );
}

export default PluginsHeaderCard;
