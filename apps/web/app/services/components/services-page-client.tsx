"use client";

import { PageBody } from '@kit/ui/page';
import { ServicesTable } from '../../../../../packages/features/team-accounts/src/components/services/services-table';
import { Elements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { useEffect } from 'react';
import { ServicesContextProvider, useServicesContext } from '../contexts/services-context';
import { useTranslation } from 'react-i18next';
interface ServicesPageClientProps {
  stripePromise: Promise<Stripe | null>;
}

const ServicesPageClientContent: React.FC<ServicesPageClientProps> = ({ stripePromise }) => {
  const { services, loading, updateServices } = useServicesContext();
  const { t } = useTranslation('orders');
  useEffect(() => {
    updateServices(true).catch((error)=> {console.log(error.message)});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
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
    <Elements stripe={stripePromise}>
      <PageBody>
        <div className='p-[35px]'>
          <div className="flex justify-between items-center mb-[32px]">
            <div className="flex-grow">
              <span>
                <div className="font-inter text-[30px] font-semibold leading-[44px] tracking-[-0.72px] text-primary-900">
                {t('services:title')} 
                </div>
              </span>
            </div>
          </div>
          <ServicesTable services={services} />
        </div>
      </PageBody>
    </Elements>
  );
};

const ServicesPageClient: React.FC<ServicesPageClientProps> = (props) => (
  <ServicesContextProvider>
    <ServicesPageClientContent {...props} />
  </ServicesContextProvider>
);

export { ServicesPageClient };