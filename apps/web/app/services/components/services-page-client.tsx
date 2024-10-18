'use client';

import { useEffect } from 'react';
import * as React from 'react';

import { Elements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { useTranslation } from 'react-i18next';

import { PageBody } from '@kit/ui/page';
import { Tabs, TabsContent, TabsList} from '@kit/ui/tabs';

import { ServicesTable } from '../../../../../packages/features/team-accounts/src/components/services/services-table';
import {
  ServicesContextProvider,
  useServicesContext,
} from '../contexts/services-context';
import { BriefsTable } from '~/team-accounts/src/components/briefs/briefs-table';
import { Brief } from '~/lib/brief.types';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';

interface ServicesPageClientProps {
  stripePromise: Promise<Stripe | null>;
  briefs : Brief.Relationships.Services.Response[]
}

const ServicesPageClientContent: React.FC<ServicesPageClientProps> = ({
  stripePromise,
  briefs
}) => {
  const { services, loading, updateServices } = useServicesContext();
  const { t } = useTranslation('orders');
  const [activeTab, setActiveTab] = React.useState<'services' | 'briefs'>(
    'services',
  );

  const handleTabClick = (value: 'services' | 'briefs') => {
    setActiveTab(value);
  };
  useEffect(() => {
    updateServices(true).catch((error) => {
      console.log(error.message);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div
          className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={(value: string) => {
        handleTabClick(value as 'services' | 'briefs');
      }}
    >
      <Elements stripe={stripePromise}>
        <PageBody>
          <div className="p-[35px]">
            <div className="mb-[32px] flex items-center justify-between">
              <div className="flex-grow">
                <span>
                  <div className="font-inter text-[30px] font-semibold leading-[44px] tracking-[-0.72px] text-primary-900">
                    {t('services:title')}
                  </div>
                </span>
              </div>
            </div>

            <TabsList className='gap-2 bg-transparent'>
          <ThemedTabTrigger value="services" activeTab={activeTab} option={'services'}>
            {t('services:serviceTitle')}
          </ThemedTabTrigger>
          <ThemedTabTrigger value="briefs" activeTab={activeTab} option={'briefs'}>
            {t('briefs:briefs', {ns:'briefs'})}
          </ThemedTabTrigger>
          </TabsList>
          </div>
        </PageBody>
      </Elements>
    </Tabs>
  );
};

const ServicesPageClient: React.FC<ServicesPageClientProps> = (props) => {
  return (
    <ServicesContextProvider>
      <ServicesPageClientContent {...props} />
    </ServicesContextProvider>
  );
};

export { ServicesPageClient };
