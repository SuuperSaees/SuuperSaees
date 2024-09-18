'use client';

import { useState, useEffect } from 'react';
import { getSubscriptionByOrganizationId } from '../../../../../../packages/features/team-accounts/src/server/actions/subscriptions/get/get-subscription';
import { updateSubscription } from '../../../../../../packages/features/team-accounts/src/server/actions/subscriptions/update/update-subscription';

export const useBilling = () => {
  const [subscription, setSubscription] = useState<{
    billing_customer_id: string;
    id: string;
    propietary_organization_id: string;
} | null>(null);
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

  const updateSubscriptionContext = async (): Promise<void> => {
    setLoading(true);
    setError(false);
    try {
      const result  = await getSubscriptionByOrganizationId();
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
      setProductSubscription(dataProduct);

      fetchInvoices(result?.billing_customer_id ?? "");
      fetchUpcomingInvoice(result?.billing_customer_id ?? "");
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const upgradeSubscription = async (): Promise<void> => {
    setLoading(true);
    setError(false);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const result = await getSubscriptionByOrganizationId();

      const responseSubscriptionsByCustomer = await fetch(`${baseUrl}/api/stripe/get-subscription-by-customer?customerId=${encodeURIComponent(result?.billing_customer_id ?? "")}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!responseSubscriptionsByCustomer.ok) {
        throw new Error('Failed to upgrade subscription');
      }

      const dataSubscriptionsByCustomer = await responseSubscriptionsByCustomer.json();

      if (dataSubscriptionsByCustomer.length > 1) {
        let newSubscriptionId = "";
        dataSubscriptionsByCustomer.forEach((subscription: any) => {
          if (subscription.id !== result?.id) {
            newSubscriptionId = subscription.id;
          }
        });
        // Cancel the other subscription
        const responseCancelSubscription = await fetch(`${baseUrl}/api/stripe/cancel-subscription?subscriptionId=${encodeURIComponent(result?.id ?? "")}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!responseCancelSubscription.ok) {
          throw new Error('Failed to upgrade subscription');
        }

        // Save the new subscription id
        await updateSubscription({
          id: newSubscriptionId,
        });
        await updateSubscriptionContext();
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!subscriptionFetchedStripe) {
      updateSubscriptionContext();
      upgradeSubscription();
    }
  }, []);

  return {
    subscription,
    subscriptionFetchedStripe,
    productSubscription,
    invoices,
    upcomingInvoice,
    totalBilled,
    loading,
    error,
    updateSubscriptionContext,
    fetchInvoices,
    fetchUpcomingInvoice,
    upgradeSubscription,
  };
};

export default useBilling;
