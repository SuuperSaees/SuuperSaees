'use client';

import { Service } from '../../../lib/services.types';
import { getServicesByOrganizationId } from '../../../../../packages/features/team-accounts/src/server/actions/services/get/get-services-by-organization-id';
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { getStripeAccountID } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
interface ServicesContextValue {
  services: Service.Type[];
  hasTheEmailAssociatedWithStripe: boolean;
  loading: boolean;
  error: boolean;
  updateServices: (showLoader:boolean) => Promise<void>;
  fetchAccountStripeConnect: () => Promise<void>;
}

const ServicesContext = createContext<ServicesContextValue | undefined>(undefined);

interface ServicesContextProviderProps {
  children: ReactNode;
}

export const ServicesContextProvider: React.FC<ServicesContextProviderProps> = ({ children }) => {
  const [services, setServices] = useState<Service.Type[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [hasTheEmailAssociatedWithStripe, setHasTheEmailAssociatedWithStripe] = useState<boolean>(false)

  const updateServices = async (showLoader:boolean): Promise<void> => {
    setLoading(showLoader);
    setError(false);
    try {
      const result = await getServicesByOrganizationId();
      setServices(result.products);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountStripeConnect = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const fetchedStripeId = await getStripeAccountID() as string;
    const response = await fetch(`${baseUrl}/api/stripe/get-account?accountId=${encodeURIComponent(fetchedStripeId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch account data from Stripe');
    }
    const data: {email: string | null} = await response.json();
    setHasTheEmailAssociatedWithStripe(!!data.email)
  }

  const value: ServicesContextValue = {
    services,
    hasTheEmailAssociatedWithStripe,
    loading,
    error,
    updateServices,
    fetchAccountStripeConnect
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServicesContext = (): ServicesContextValue => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServicesContext must be used within a ServicesContextProvider');
  }
  return context;
};

export default ServicesContext;