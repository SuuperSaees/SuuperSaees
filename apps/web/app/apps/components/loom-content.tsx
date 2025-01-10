import React, { useEffect, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from 'lucide-react';
import { CopyDomain } from 'node_modules/@kit/accounts/src/components/personal-account-settings/copy-domain';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Spinner } from '@kit/ui/spinner';

import { getDomainByUserId } from '~/multitenancy/utils/get/get-domain';

import { getAccountPluginByIdAction } from '../../../../../packages/plugins/src/server/actions/account-plugins/get-account-plugin-by-Id';
import { updateAccountPluginAction } from '../../../../../packages/plugins/src/server/actions/account-plugins/update-account-plugin';

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

  const updateCredentialsMutation = useMutation({
    mutationFn: async () => {
      const updates = {
        credentials: { loom_app_id: loomAppId },
        provider: 'loom',
      };

      return await updateAccountPluginAction(pluginId, updates);
    },
    onSuccess: () => {
      toast.success(t('successMessage'), {
        description: t('pluginUpdatedSuccessfully'),
      });
    },
    onError: (error) => {
      console.error('Error en cliente:', error);
      toast.error(t('errorMessage'), {
        description: t('errorUpdatingPlugin'),
      });
    },
  });

  return (
    <div className="space-y-8">
      {isLoading ? (
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
                onBlur={() => updateCredentialsMutation.mutate()}
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
