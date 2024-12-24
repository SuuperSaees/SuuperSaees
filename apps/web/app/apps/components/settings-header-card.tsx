'use client';

import { useTranslation } from 'react-i18next';

import { Card } from '@kit/ui/card';
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import { Ellipsis, Trash2 } from 'lucide-react';
  
function SettingsHeaderCard({ provider }: { provider: string }) {
  const { t } = useTranslation('plugins');
  return (
    <Card className="flex items-center justify-between px-3 py-5 my-6 bg-transparent">
      <div className="flex items-center gap-2">
        <img src={`/images/plugins/${provider}.png`} alt={provider} className="h-10 w-10" />
        <h1>{t(`${provider}Title`)}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Ellipsis className="w-5 h-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              {t('uninstall')}
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}

export default SettingsHeaderCard;
