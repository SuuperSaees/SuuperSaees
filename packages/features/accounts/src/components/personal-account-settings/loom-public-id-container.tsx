'use client';
import React, { useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-react';

import { Spinner } from '@kit/ui/spinner';

import { getAccountPlugin } from '../../../../../../apps/web/app/server/actions/account-plugins/account-plugins.action';
import { updateAccountPlugin } from '../../../../../../apps/web/app/server/actions/account-plugins/account-plugins.action';
import { getDomainByUserId } from '../../../../../multitenancy/utils/get/get-domain';
import { ThemedInput } from '../ui/input-themed-with-settings';
import { CopyDomain } from './copy-domain';

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
  const { isLoading } = useQuery({
    queryKey: ['plugin', pluginId],
    queryFn: async () => {
      if (!pluginId) {
        return null;
      }
      
      try {
        const response = await getAccountPlugin(pluginId);
        
        if (response) {
          const credentials = response.credentials as Record<string, unknown>;
          if (typeof credentials?.loom_app_id === 'string') {
            setLoomAppId(credentials.loom_app_id);
          }
          return response;
        } 
        
        throw new Error('Failed to fetch plugin data');
      } catch (error) {
        console.error('Error fetching plugin data:', error);
        toast.error(t('errorFetchingPlugin'), {
          description: t('errorFetchingPluginDescription'),
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
        return { domain: '' };
      }
    },
    enabled: !!userId,
    retry: 1
  });

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
      toast.success(t('updateSuccess'), {
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

  const domain = domainData?.domain ?? '';

  return (
    <>
      {isLoading ? (
        <Spinner className="h-5" />
      ) : (
        <div className="w-full">
          <CopyDomain
            value={domain}
            className="mb-3"
            label={t('loomAppIdTitle')}
          />
          <div className="relative">
            <ThemedInput
              data-test={'account-display-name'}
              minLength={2}
              placeholder={t('loomAppIdTitle')}
              maxLength={100}
              type={showLoomAppId ? 'text' : 'password'}
              value={loomAppId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLoomAppId(e.target.value)
              }
              onBlur={() => updateCredentialsMutation.mutate()}
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
      )}
    </>
  );
}

export default LoomPublicIdContainer;
