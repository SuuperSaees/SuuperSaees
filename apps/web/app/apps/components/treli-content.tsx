import React, { useEffect, useState } from 'react';

import { Copy, Eye, EyeOff, Info } from 'lucide-react';
import { CopyDomain } from 'node_modules/@kit/accounts/src/components/personal-account-settings/copy-domain';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Spinner } from '@kit/ui/spinner';

import Tooltip from '~/components/ui/tooltip';

import { getAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';
import { updateAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';

function TreliContentStatic({
  pluginId,
  userId,
}: {
  pluginId: string;
  userId: string;
}) {
  const [credentials, setCredentials] = useState<{
    treli_user: string;
    treli_password: string;
    webhook_url: string;
  }>({
    treli_user: '',
    treli_password: '',
    webhook_url: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const webhookUrl =
    process.env.NODE_ENV === 'production'
      ? 'app.suuper.co/api/v1/webhook'
      : 'app.dev.suuper.co/api/v1/webhook';

  const { t } = useTranslation('plugins');

  useEffect(() => {
    if (!pluginId) return;

    const fetchPluginData = async () => {
      try {
        setIsLoading(true);
        const response = await getAccountPlugin(pluginId);

        if (response) {
          const fetchedCredentials = response.credentials as Record<string, unknown>;

          setCredentials({
            treli_user: (fetchedCredentials?.treli_user as string) || '',
            treli_password:
              (fetchedCredentials?.treli_password as string) || '',
            webhook_url: (fetchedCredentials?.webhook_url as string) || '',
          });
        } else {
          throw new Error(t('errorFetchingTreliCredentials'));
        }
      } catch (error) {
        console.error(t('errorFetchingTreliCredentials'), error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPluginData();
  }, [pluginId, t]);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('successMessage'), {
        description: t('clipboardCopied'),
      });
    } catch (error) {
      console.error(t('clipboardCopyError'), error);
      toast.error(t('errorMessage'), {
        description: t('clipboardCopyError'),
      });
    }
  };

  const handleUpdate = async (field: string, value: string) => {
    try {
      const updatedCredentials = { ...credentials, [field]: value };

      const providerId = crypto.randomUUID();

      await updateAccountPlugin(
        pluginId,
        {
          credentials: updatedCredentials,
          provider: 'treli',
          account_id: userId,
          provider_id: providerId,
        },
      );

      setCredentials(updatedCredentials);
      toast.success(t('successMessage'), {
        description: t('fieldUpdated'),
      });
    } catch (error) {
      console.error(t('updateError', { field }), error);
      toast.error(t('errorMessage'), {
        description: t('updateError'),
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      {isLoading ? (
        <Spinner className="h-5" />
      ) : (
        <>
          {/* Usuario Treli */}
          <div className="mb-6 grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 text-sm font-medium text-gray-700">
              {t('treliUser')} *
            </label>
            <div className="relative col-span-2">
              <ThemedInput
                className="w-full"
                value={credentials.treli_user}
                placeholder={t('treliUserPlaceholder')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('treli_user', e.target.value)
                }
                onBlur={() =>
                  handleUpdate('treli_user', credentials.treli_user)
                }
              />
              <button
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                type="button"
                onClick={() => handleCopyToClipboard(credentials.treli_user)}
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Contraseña Treli */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 text-sm font-medium text-gray-700">
              {t('treliPassword')} *
            </label>
            <div className="relative col-span-2">
              <ThemedInput
                className="w-full"
                type={showPassword ? 'text' : 'password'}
                value={credentials.treli_password}
                placeholder={t('treliPasswordPlaceholder')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('treli_password', e.target.value)
                }
                onBlur={() =>
                  handleUpdate('treli_password', credentials.treli_password)
                }
              />
              <button
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Webhook Section */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-800">
              {t('connectTreliWebhook')}
            </h3>
            <p className="mt-1 flex items-center text-sm text-gray-500">
              {t('tooltipWebhookDescription')}
              <Tooltip
                content={
                  <div className="max-w-xs text-xs">
                    {t('tooltipWebhookDescription')} <br />
                    <span className="font-semibold">{t('tooltipSteps')}</span>
                    <ol className="ml-4 mt-1 list-decimal">
                      <li>{t('step1')}</li>
                      <li>{t('step2')}</li>
                      <li>{t('step3')}</li>
                      <li>{t('step4')}</li>
                    </ol>
                  </div>
                }
                delayDuration={300}
              >
                <button
                  type="button"
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  aria-label={t('tooltipMoreInfo')}
                >
                  <Info className="h-4 w-4" />
                </button>
              </Tooltip>
            </p>
            <div className="mt-4 grid grid-cols-3 items-center gap-4">
              <label className="col-span-1 text-sm font-medium text-gray-700">
                {t('webhookUrl')}
              </label>
              <div className="relative col-span-2">
                <CopyDomain value={webhookUrl} className="mt-4" label={''} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TreliContentStatic;
