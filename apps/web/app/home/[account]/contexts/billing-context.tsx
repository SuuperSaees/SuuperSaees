'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Subscription } from '~/lib/subscriptions.types';
import { getSubscriptionByOrganizationId } from '../../../../../../packages/features/team-accounts/src/server/actions/subscriptions/get/get-subscrioption-by-organization-id';

interface BillingContextValue {
  subscription: Subscription.Type; 
  subscriptionFetchedStripe: any;
  productSubscription: any;
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
  const [subscriptionFetchedStripe, setSubscriptionFetchedStripe] = useState<any>(null);
  const [productSubscription, setProductSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]); 
  const [upcomingInvoice, setUpcomingInvoice] = useState<any>(null); 
  const [totalBilled, setTotalBilled] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

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
      setInvoices(data); 
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
      setUpcomingInvoice(data);
    } catch (error) {
      console.error("Error fetching upcoming invoice:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (): Promise<void> => {
    setLoading(true);
    setError(false);
    try {
      const result = await getSubscriptionByOrganizationId();
      setSubscription(result);
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const responseSubscription = await fetch(`${baseUrl}/api/stripe/get-subscription?subscriptionId=${encodeURIComponent(result?.id ?? "")}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!responseSubscription.ok) {
        throw new Error('Failed to fetch subscription');
      }
      const dataSubscription = await responseSubscription.json();
      setSubscriptionFetchedStripe(dataSubscription); 
      //////////////////////////////////////
      const responseProduct = await fetch(`${baseUrl}/api/stripe/get-product?productId=${encodeURIComponent(dataSubscription?.plan?.product ?? "")}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!responseProduct.ok) {
        throw new Error('Failed to fetch product');
      }
      const dataProduct = await responseProduct.json();
      setProductSubscription(dataProduct)
      fetchInvoices(result?.billing_customer_id ?? "");
      fetchUpcomingInvoice(result?.billing_customer_id ?? "")
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!subscriptionFetchedStripe) {
        updateSubscription();
    }
}, [subscriptionFetchedStripe]);

  const value: BillingContextValue = {
    subscription,
    subscriptionFetchedStripe,
    productSubscription,
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
