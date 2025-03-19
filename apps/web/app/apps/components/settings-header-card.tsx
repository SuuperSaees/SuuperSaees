'use client';

import { useRouter } from 'next/navigation';

import { Ellipsis, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Card } from '@kit/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

import { updateAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';

interface SettingsHeaderCardProps {
  name: string;
  pluginId: string;
  icon_url?: string | null;
}

function SettingsHeaderCard({
  name,
  pluginId,
  icon_url,
}: SettingsHeaderCardProps) {
  const { t } = useTranslation('plugins');
  const router = useRouter();

  const handleUninstall = async () => {
    if (!pluginId) {
      toast.error(t('errorMessage'), {
        description: t('errorDeletingPlugin'),
      });
      return;
    }

    try {
      await updateAccountPlugin(pluginId, { status: 'uninstalled' });
      toast.success(t('successMessage'), {
        description: t('pluginDeletedSuccessfully'),
      });

      router.replace('/apps');
    } catch (error) {
      console.error('Error uninstalling plugin:', error);
      toast.error(t('errorMessage'), {
        description: t('errorDeletingPlugin'),
      });
    }
  };

  return (
    <Card className="my-6 flex items-center justify-between bg-transparent px-3 py-5">
      <div className="flex items-center gap-2">
        <img
          src={icon_url ?? `/images/plugins/default.png`}
          alt={name}
          className="h-10 w-10"
          onError={(e) => (e.currentTarget.src = '/images/plugins/default.png')}
        />
        <h1 className="text-lg font-bold">{t(`${name}Title`)}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Ellipsis className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleUninstall}>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {t('uninstall')}
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}

export default SettingsHeaderCard;
