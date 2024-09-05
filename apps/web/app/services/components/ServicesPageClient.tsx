"use client";

import { PageBody } from '@kit/ui/page';
import { ServicesTable } from '../../../../../packages/features/team-accounts/src/components/services/services-table';
import { Elements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { Service } from '~/lib/services.types';
import {getServicesByOrganizationId} from "../../../../../packages/features/team-accounts/src/server/actions/services/get/get-services-by-organization-id"
interface ServicesPageClientProps {
  stripePromise: Promise<Stripe | null>;
}

const ServicesPageClient: React.FC<ServicesPageClientProps> = ({ stripePromise }) => {
  const [services, setServices] = useState<Service.Type[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(()=> {
    const fetchedServicesByOrganizationId = async () => {
      const resultFetchedServicesByOrganizationId = await getServicesByOrganizationId()
      setServices([...resultFetchedServicesByOrganizationId.products])
      setLoading(false)
    }
    void fetchedServicesByOrganizationId()
  }, [])
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
          </div>
          <ServicesTable services={services}  />
        </div>
      </PageBody>
    </Elements>
  );
};

export default ServicesPageClient;
