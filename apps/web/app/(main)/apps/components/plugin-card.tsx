'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { Download, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { Switch } from '@kit/ui/switch';

import { createAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';
import { deleteAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';
import { updateAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';

interface AppCardProps {
  pluginId?: string;
  id: string;
  name: string;
  status?: 'installed' | 'uninstalled' | 'failed' | 'in progress';
  mode: 'install' | 'settings';
  icon_url?: string | null;
}

export default function PluginCard({
  pluginId,
  id,
  name,
  status,
  mode,
  icon_url,
}: AppCardProps) {
  const { t } = useTranslation('plugins');
  const router = useRouter();
  const [isInstalled, setIsInstalled] = useState(status === 'installed');
  const { user } = useUserWorkspace();
  const userId = user.id;

  useEffect(() => {
    setIsInstalled(status === 'installed');
  }, [status]);

  const updatePluginMutation = useMutation({
    mutationFn: async (newStatus: 'installed' | 'uninstalled') => {
      await updateAccountPlugin(pluginId ?? '', {
        status: newStatus,
      });
    },
    onMutate: (newStatus: 'installed' | 'uninstalled') => {
      setIsInstalled(newStatus === 'installed');
    },
    onError: (_error, newStatus) => {
      setIsInstalled(newStatus === 'installed' ? false : true);
      toast.error(t('errorMessage'), {
        description: t('errorUpdatingPlugin'),
      });
    },
    onSuccess: () => {
      toast.success(t('successMessage'), {
        description: t('pluginUpdatedSuccessfully'),
      });
      router.refresh();
    },
  });

  const createPluginMutation = useMutation({
    mutationFn: async () => {
      await createAccountPlugin({
        plugin_id: id,
        account_id: userId,
        status: 'installed',
        credentials: {},
      });
    },
    onMutate: () => {
      setIsInstalled(true);
    },
    onError: () => {
      setIsInstalled(false);
      toast.error(t('errorMessage'), {
        description: t('errorInstallingPlugin'),
      });
    },
    onSuccess: () => {
      toast.success(t('successMessage'), {
        description: t('pluginInstalledSuccessfully'),
      });
      router.refresh();
    },
  });

  const deletePluginMutation = useMutation({
    mutationFn: async () => {
      await deleteAccountPlugin(
        pluginId ?? '',
        userId,
        name.toLowerCase(),
      );
    },
    onError: () => {
      toast.error(t('errorMessage'), {
        description: t('errorDeletingPlugin'),
      });
    },
    onSuccess: () => {
      toast.success(t('successMessage'), {
        description: t('pluginDeletedSuccessfully'),
      });
      router.refresh();
    },
  });

  const handleSwitchChange = (checked: boolean) => {
    const newStatus = checked ? 'installed' : 'uninstalled';
    updatePluginMutation.mutate(newStatus);
  };

  const handleDeleteClick = () => {
    if (pluginId) {
      deletePluginMutation.mutate();
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-md overflow-hidden">
            {icon_url ? (
              <img
                src={icon_url}
                alt={`${name} icon`}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gray-200" />
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-medium">{t(`${name}Title`)}</h3>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('freeInstall')}
          </p>
        </div>
        {mode === 'settings' && (
          <div className="flex items-center gap-2 self-center">
            <Switch
              checked={isInstalled}
              onCheckedChange={handleSwitchChange}
              className="data-[state=checked]:bg-BlueDark-700"
            />
            {isInstalled ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  router.push(
                    `/apps/settings?provider=${name}&pluginId=${pluginId}&iconUrl=${icon_url}`,
                  );
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleDeleteClick}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            )}
          </div>
        )}
        {mode === 'install' &&
          (isInstalled ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                router.push(
                  `/apps/settings?provider=${name}&pluginId=${pluginId}&iconUrl=${icon_url}`,
                );
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => createPluginMutation.mutate()}
            >
              <Download className="h-6 w-6 text-gray-600" />
            </Button>
          ))}
      </div>
    </Card>
  );
}
