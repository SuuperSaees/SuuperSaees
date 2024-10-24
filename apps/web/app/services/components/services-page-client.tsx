'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Elements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { useTranslation } from 'react-i18next';

import { PageBody } from '@kit/ui/page';
import { Tabs, TabsContent } from '@kit/ui/tabs';

import { BriefsTable } from '~/team-accounts/src/components/briefs/briefs-table';

import { ServicesTable } from '../../../../../packages/features/team-accounts/src/components/services/services-table';
import { useStripeActions } from '../hooks/use-stripe-actions';

interface ServicesPageClientProps {
  stripePromise: Promise<Stripe | null>;
  accountRole: string;
}

const ServicesPageClientContent: React.FC<ServicesPageClientProps> = ({
  stripePromise,
  accountRole,
}) => {
  const searchParams = useSearchParams();
  const briefsView = searchParams.get('briefs');
  const router = useRouter();

  const { t } = useTranslation('orders');

  const [activeTab, setActiveTab] = useState<'services' | 'briefs'>(
    briefsView === 'true' ? 'briefs' : 'services',
  );

  const { services, briefs, hasTheEmailAssociatedWithStripe, handleCheckout } =
    useStripeActions({
      userRole: accountRole,
    });

  const handleTabClick = (value: 'services' | 'briefs') => {
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={(value: string) => {
        if (value === 'services' && briefsView === 'true') {
          handleTabClick(value);
          router.push('/services');
        }
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
            <TabsContent className="bg-transparent" value="services">
              <ServicesTable
                activeTab={activeTab}
                services={services}
                accountRole={accountRole}
                hasTheEmailAssociatedWithStripe={
                  hasTheEmailAssociatedWithStripe
                }
                handleCheckout={handleCheckout}
              />
            </TabsContent>
            <TabsContent className="bg-transparent" value="briefs">
              <BriefsTable activeTab={activeTab} briefs={briefs} />
            </TabsContent>
          </div>
        </PageBody>
      </Elements>
    </Tabs>
  );
};

const ServicesPageClient: React.FC<ServicesPageClientProps> = (props) => {
  return <ServicesPageClientContent {...props} />;
};

export { ServicesPageClient };
