'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

// import { Elements } from '@stripe/react-stripe-js';
// import { Stripe } from '@stripe/stripe-js';

import { PageBody } from '@kit/ui/page';
import { Tabs, TabsContent } from '@kit/ui/tabs';

import { BriefsTable } from '~/team-accounts/src/components/briefs/briefs-table';

import { ServicesTable } from '../../../../../packages/features/team-accounts/src/components/services/services-table';
import { useStripeActions } from '../hooks/use-stripe-actions';
import { PageHeader } from '../../components/page-header';
import { TimerContainer } from '../../components/timer-container';

import { BillingAccounts } from '~/lib/billing-accounts.types';

interface ServicesPageClientProps {
  accountRole: string;
  paymentsMethods: BillingAccounts.PaymentMethod[];
}

const ServicesPageClientContent: React.FC<ServicesPageClientProps> = ({
  accountRole,
  paymentsMethods,
}) => {
  const searchParams = useSearchParams();
  const briefsView = searchParams.get('briefs');
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'services' | 'briefs'>(
    briefsView === 'true' ? 'briefs' : 'services',
  );

  const { services, briefs, briefsAreLoading, servicesAreLoading } =
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
        <PageBody>
          <div className="p-[35px]">
            <PageHeader
              title='services:title'
              rightContent={
                <TimerContainer />
              }
            />
            <TabsContent className="bg-transparent" value="services">
              <ServicesTable
                activeTab={activeTab}
                services={services}
                accountRole={accountRole}
                paymentsMethods={paymentsMethods}
                isLoading={servicesAreLoading}
              />
            </TabsContent>
            <TabsContent className="bg-transparent" value="briefs">
              <BriefsTable activeTab={activeTab} briefs={briefs} accountRole={accountRole} isLoading={briefsAreLoading} />
            </TabsContent>
          </div>
        </PageBody>
    </Tabs>
  );
};

const ServicesPageClient: React.FC<ServicesPageClientProps> = (props) => {
  return <ServicesPageClientContent {...props} />;
};

export { ServicesPageClient };
