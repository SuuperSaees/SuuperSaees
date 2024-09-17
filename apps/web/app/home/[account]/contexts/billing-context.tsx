'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Subscription } from '~/lib/subscriptions.types';
import { getSubscriptionByOrganizationId } from '../../../../../../packages/features/team-accounts/src/server/actions/subscriptions/get/get-subscrioption-by-organization-id';

interface BillingContextValue {
  subscription: Subscription.Type; 
  invoices: any[]; 
  upcomingInvoice: any; 
  totalBilled: number;
  loading: boolean;
  error: boolean;
  updateSubscription: () => Promise<void>;
  fetchInvoices: (customerId: string) => Promise<void>;
  fetchUpcomingInvoice: (customerId: string) => Promise<void>;
}

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

interface BillingContextProviderProps {
  children: ReactNode;
}

export const BillingContextProvider: React.FC<BillingContextProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<any>(null); 
  const [invoices, setInvoices] = useState<any[]>([]); 
  const [upcomingInvoice, setUpcomingInvoice] = useState<any>(null); 
  const [totalBilled, setTotalBilled] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const updateSubscription = async (): Promise<void> => {
    setLoading(true);
    setError(false);
    try {
      const result = await getSubscriptionByOrganizationId();
      setSubscription(result);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async (customerId: string): Promise<void> => {
    setLoading(true);
    setError(false);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/stripe/get-invoices?customerId=${encodeURIComponent(customerId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data = await response.json();
      setInvoices(data.invoices); 
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingInvoice = async (customerId: string): Promise<void> => {
    setLoading(true);
    setError(false);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/stripe/get-invoices/upcoming?customerId=${encodeURIComponent(customerId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming invoice');
      }
      const data = await response.json();
      setUpcomingInvoice(data.upcomingInvoice);
    } catch (error) {
      console.error("Error fetching upcoming invoice:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const value: BillingContextValue = {
    subscription,
    invoices,
    upcomingInvoice,
    totalBilled,
    loading,
    error,
    updateSubscription,
    fetchInvoices,
    fetchUpcomingInvoice
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};

export const useBillingContext = (): BillingContextValue => {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBillingContext must be used within a BillingContextProvider');
  }
  return context;
};

export default BillingContext;
