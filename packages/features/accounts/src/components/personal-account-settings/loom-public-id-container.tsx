import React, { useEffect, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Spinner } from '@kit/ui/spinner';

import { getAccountPluginByIdAction } from '../../../../../../packages/plugins/src/server/actions/account-plugins/get-account-plugin-by-Id';
import { updateAccountPluginAction } from '../../../../../../packages/plugins/src/server/actions/account-plugins/update-account-plugin';
import { AccountPluginInsert } from '../../../../../../packages/plugins/src/types';
import { getDomainByUserId } from '../../../../../multitenancy/utils/get/get-domain';
import { ThemedInput } from '../ui/input-themed-with-settings';
import { CopyDomain } from './copy-domain';

import { Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-react';

interface LoomPublicIdContainerProps {
  pluginId: string;
  userId: string;
}

function LoomPublicIdContainer({
  pluginId,
  userId,
}: LoomPublicIdContainerProps) {
  const [loomAppId, setLoomAppId] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLoomAppId, setShowLoomAppId] = useState<boolean>(false);

  const { t } = useTranslation('account');

  useEffect(() => {
    if (!pluginId) return;

    const fetchPluginData = async () => {
      try {
        setIsLoading(true);
        const response = await getAccountPluginByIdAction(pluginId);

        if (response?.success) {
          const credentials = response.success.data?.credentials as Record<
            string,
            unknown
          >;
          if (typeof credentials.loom_app_id === 'string') {
            setLoomAppId(credentials.loom_app_id);
          }
        } else {
          throw new Error(
            response?.error?.message ?? 'Failed to fetch plugin data',
          );
        }
      } catch (error) {
        console.error('Error fetching plugin data:', error);
        toast.error(t('errorFetchingPlugin'), {
          description: t('errorFetchingPluginDescription'),
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPluginData();
  }, [pluginId, t]);

  useEffect(() => {
    if (!userId) return;

    const fetchDomain = async () => {
      try {
        const domainData = await getDomainByUserId(userId);
        if (domainData?.domain) {
          setDomain(domainData.domain);
        }
      } catch (error) {
        console.error('Error fetching domain:', error);
      }
    };

    void fetchDomain();
  }, [userId]);

  const updateOrganizationMutation = useMutation({
    mutationFn: async () => {
      const updates: Partial<AccountPluginInsert> = {
        credentials: { loom_app_id: loomAppId },
      };

      return await updateAccountPluginAction(pluginId, updates);
    },
    onSuccess: () => {
      toast.success(t('updateSuccess'), {
        description: t('pluginUpdatedSuccessfully'),
      });
    },
    onError: (error) => {
      console.error('Error updating plugin:', error);
      toast.error(t('updateError'), {
        description: t('pluginUpdateErrorDescription'),
      });
    },
  });

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
              onBlur={() => updateOrganizationMutation.mutate()}
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
