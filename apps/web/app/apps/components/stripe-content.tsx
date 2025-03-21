'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useTranslation } from 'react-i18next';

import { getAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';

function StripeContent({ pluginId }: { pluginId: string; userId: string }) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { t } = useTranslation('plugins');

  useEffect(() => {
    if (!pluginId) return;

    const fetchPluginData = async () => {
      try {
        setIsLoading(true);

        const response = await getAccountPlugin(pluginId);

        if (response) {
          const providerId = response.provider_id;

          setIsConnected(!!providerId);
        } else {
          console.error('Error fetching plugin');
        }
      } catch (error) {
        console.error('Error fetching plugin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPluginData();
  }, [pluginId]);

  const handleConnect = () => {
    router.push('/stripe');
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center space-x-4">
        <Image
          src="/images/plugins/stripe.png"
          alt="Stripe Logo"
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="text-sm font-medium text-gray-800">Stripe</span>
      </div>

      <button
        onClick={handleConnect}
        className="text-sm font-medium text-blue-600 hover:underline"
        disabled={isLoading}
      >
        {isLoading ? t('loading') : isConnected ? t('reconnect') : t('connect')}
      </button>
    </div>
  );
}

export default StripeContent;
