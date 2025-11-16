'use client';

import React, { useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-react';
import { CopyDomain } from 'node_modules/@kit/accounts/src/components/personal-account-settings/copy-domain';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Spinner } from '@kit/ui/spinner';

import { getDomainByUserId } from '~/multitenancy/utils/get/get-domain';

import { getAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';
import { updateAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';
import { isValidUUID } from '~/utils/generate-uuid';

interface LoomPublicIdContainerProps {
  pluginId: string;
  userId: string;
}

function LoomPublicIdContainer({
  pluginId,
  userId,
}: LoomPublicIdContainerProps) {
  const [loomAppId, setLoomAppId] = useState<string>('');
  const [showLoomAppId, setShowLoomAppId] = useState<boolean>(false);

  const { t } = useTranslation('account');

  // Fetch plugin data using React Query
  const { isLoading: isLoadingPlugin } = useQuery({
    queryKey: ['plugin', pluginId],
    queryFn: async () => {
      if (!pluginId) {
        return null;
      }
      
      try {
        const accountPlugin = await getAccountPlugin(pluginId)
        
        if (accountPlugin) {
          const credentials = accountPlugin.credentials as Record<string, unknown>;
          if (typeof credentials?.loom_app_id === 'string') {
            setLoomAppId(credentials.loom_app_id);
          }
          return accountPlugin;
        } 
        
        throw new Error('Failed to fetch plugin data');
      } catch (error) {
        console.error('Error fetching plugin data:', error);
        toast.error(t('errorMessage'), {
          description: t('errorFetchingPluginData')
        });
        throw error;
      }
    },
    enabled: !!pluginId,
    retry: 1
  });

  // Fetch domain data using React Query
  const { data: domainData } = useQuery({
    queryKey: ['domain', userId],
    queryFn: async () => {
      if (!userId) {
        return { domain: '' };
      }
      
      try {
        const domain = await getDomainByUserId(userId);
        return domain;
      } catch (error) {
        console.error('Error fetching domain:', error);
        toast.error(t('errorMessage'), {
          description: t('errorFetchingDomain')
        });
        return { domain: '' };
      }
    },
    enabled: !!userId,
    retry: 1
  });

  // Update credentials mutation
  const updateCredentialsMutation = useMutation({
    mutationFn: async () => {
      if (!pluginId) {
        throw new Error('Plugin ID is required');
      }
      
      const updates = {
        credentials: { loom_app_id: loomAppId },
        provider: 'loom',
      };

      return await updateAccountPlugin(pluginId, updates);
    },
    onSuccess: () => {
      if (!loomAppId) return;
      toast.success(t('successMessage'), {
        description: t('pluginUpdatedSuccessfully'),
      });
    },
    onError: (error: unknown) => {
      console.error('Error updating plugin:', error);
      toast.error(t('errorMessage'), {
        description: t('errorUpdatingPlugin'),
      });
    },
  });

  const handleUpdateCredentials = () => {
    if (!isValidUUID(loomAppId) && loomAppId) {
      toast.error(t('errorMessage'), {
        description: t('invalidLoomAppIdFormat')
      });
      return;
    }
    updateCredentialsMutation.mutate();
  };

  const domain = domainData?.domain ?? '';

  return (
    <div className="space-y-8">
      {isLoadingPlugin ? (
        <Spinner className="h-5" />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 text-sm font-medium text-gray-700">
              {t('allowedDomains')}
            </label>
            <div className="relative col-span-2">
              <CopyDomain value={domain} className="w-full" label={''} />
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 text-sm font-medium text-gray-700">
              {t('loomAppId')}
            </label>
            <div className="relative col-span-2">
              <ThemedInput
                data-test={'account-display-name'}
                minLength={2}
                placeholder={t('loomAppIdPlaceholder')}
                maxLength={100}
                type={showLoomAppId ? 'text' : 'password'}
                value={loomAppId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLoomAppId(e.target.value)
                }
                onBlur={handleUpdateCredentials}
                className="w-full"
              />
              <button
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                type="button"
                onClick={() => setShowLoomAppId(!showLoomAppId)}
              >
                {showLoomAppId ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LoomPublicIdContainer;
