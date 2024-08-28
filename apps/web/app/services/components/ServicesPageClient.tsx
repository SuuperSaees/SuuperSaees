"use client";

import { PageBody } from '@kit/ui/page';
import { ServicesTable } from '../../../../../packages/features/team-accounts/src/components/services/services-table';
import { Button } from '@kit/ui/button';
import { BellIcon } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { useStripeProducts } from '../hooks/use-stripe';
import { Stripe } from '@stripe/stripe-js';


interface ServicesPageClientProps {
  stripeId?: string | null;
  stripePromise: Promise<Stripe | null>;
}

const ServicesPageClient: React.FC<ServicesPageClientProps> = ({ stripeId, stripePromise }) => {
  const { products, loading } = useStripeProducts(stripeId!);

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
                <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px]">
                  Servicios
                </div>
              </span>
            </div>
            <div className="flex space-x-4">
              <span>
                <Button variant="outline">
                  Tu prueba gratuita termina en xx días
                </Button>
              </span>
              <span>
                <Button variant="outline" size="icon">
                  <BellIcon className="h-4 w-4" />
                </Button>
              </span>
            </div>
          </div>
          <ServicesTable services={products}  />
        </div>
      </PageBody>
    </Elements>
  );
};

export default ServicesPageClient;
