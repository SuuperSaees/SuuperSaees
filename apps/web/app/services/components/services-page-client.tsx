'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Elements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';

import { PageBody } from '@kit/ui/page';
import { Tabs, TabsContent } from '@kit/ui/tabs';

import { BriefsTable } from '~/team-accounts/src/components/briefs/briefs-table';

import { ServicesTable } from '../../../../../packages/features/team-accounts/src/components/services/services-table';
import { useStripeActions } from '../hooks/use-stripe-actions';
import { PageHeader } from '../../components/page-header';
import { TimerContainer } from '../../components/timer-container';

interface ServicesPageClientProps {
  stripePromise: Promise<Stripe | null>;
  accountRole: string;
  stripeId: string;
  organizationId: string;
}

const ServicesPageClientContent: React.FC<ServicesPageClientProps> = ({
  stripePromise,
  accountRole,
  stripeId,
  organizationId,
}) => {
  const searchParams = useSearchParams();
  const briefsView = searchParams.get('briefs');
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'services' | 'briefs'>(
    briefsView === 'true' ? 'briefs' : 'services',
  );

  const { services, briefs, hasTheEmailAssociatedWithStripe, handleCheckout, briefsAreLoading, servicesAreLoading } =
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
                hasTheEmailAssociatedWithStripe={
                  hasTheEmailAssociatedWithStripe
                }
                handleCheckout={handleCheckout}
                isLoading={servicesAreLoading}
                stripeId={stripeId}
                organizationId={organizationId}
              />
            </TabsContent>
            <TabsContent className="bg-transparent" value="briefs">
              <BriefsTable activeTab={activeTab} briefs={briefs} accountRole={accountRole} isLoading={briefsAreLoading} />
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
