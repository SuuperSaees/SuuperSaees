'use client';

import { useState } from 'react';

import { ChevronRight, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '@kit/ui/card';

import StoreDialog from './store-dialog';

interface PluginsHeaderCardProps {
  plugins: {
    id: string;
    name: string;
    status: 'installed' | 'uninstalled' | 'failed' | 'in progress';
    icon_url?: string | null;
    pluginId?: string;
  }[];
}

function PluginsHeaderCard({ plugins }: PluginsHeaderCardProps) {
  const { t } = useTranslation('plugins');
  const [isOpenStoreDialog, setIsOpenStoreDialog] = useState(false);

  return (
    <>
      <Card
        className="group cursor-pointer border border-gray-600 shadow-md transition-colors hover:bg-gray-50"
        onClick={() => setIsOpenStoreDialog(true)}
      >
        <div className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-600/15 text-gray-600">
            <Rocket className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-700">{t('headerTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('headerDescription')}
            </p>
          </div>
          <ChevronRight className="h-6 w-6 text-muted-foreground transition-colors" />
        </div>
      </Card>
      <StoreDialog
        isOpen={isOpenStoreDialog}
        setIsOpen={setIsOpenStoreDialog}
        plugins={plugins}
      />
    </>
  );
}

export default PluginsHeaderCard;
