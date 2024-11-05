'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSubscriptionByOrganizationId } from '../../../../../../packages/features/team-accounts/src/server/actions/subscriptions/get/get-subscription';
import { updateSubscription } from '../../../../../../packages/features/team-accounts/src/server/actions/subscriptions/update/update-subscription';
// import { BillingProviderSchema } from '@kit/billing';
export const useBilling = () => {
  const [subscription, setSubscription] = useState<{
    billing_customer_id: string;
    id: string;
    propietary_organization_id: string;
} | null>(null);
  const [showUpgradeComponent, setShowUpgradeComponent] = useState(false);
  const [accountBillingTab, setAccountBillingTab] = useState("account");
  const [subscriptionFetchedStripe, setSubscriptionFetchedStripe] = useState<any>(null);
  const [productSubscription, setProductSubscription] = useState<any>(null);
  const [productsDataConfig, setProductsDataConfig] = useState<{
    products: any[];
  } | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [upcomingInvoice, setUpcomingInvoice] = useState<any>(null);
  const [totalBilled] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasFetched, setHasFetched] = useState(false);

  const featuresByProduct = {
    "starter": ["unlimitedServices", "unlimitedClients", "unlimitedProjects"],
    "premium": ["calendarView", "whiteBrandingPortal", "customDomain"],
    "advanced": ["customEmails", "apiIntegration", "zapierAutomation"],
  }

  const fetchInvoices = async (customerId: string): Promise<void> => { 
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/stripe/get-invoices?customerId=${encodeURIComponent(customerId)}`, {
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
      const response = await fetch(`/api/stripe/get-invoices/upcoming?customerId=${encodeURIComponent(customerId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming invoice');
      }
      const data = await response.json();
      setUpcomingInvoice(data)
    } catch (error) {
      console.error("Error fetching upcoming invoice:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const [lastProductsFetch, setLastProductsFetch] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const fetchProducts = useCallback(async () => {
    // Check if we have recent data
    const now = Date.now();
    if (productsDataConfig && (now - lastProductsFetch) < CACHE_DURATION) {
      return; // Use cached data
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/stripe/suuper-products`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Error fetching products");
      }
      const data = await response.json() as { name: string; id: string; default_price: string }[];

// Create a products map for O(1) access instead of using find() multiple times
const productsMap = data.reduce((acc, product) => ({
  ...acc,
  [product.name.toLowerCase()]: {
    id: product.id,
    default_price: product.default_price
  }
}), {} as Record<string, { id: string; default_price: string }>);

// Use direct map access for better performance
const productsDataConfigBase = [
  {
    id: productsMap.starter?.id ?? '',
    name: "Starter",
    plan: {
      id: productsMap.starter?.default_price ?? '',
      currency: "USD",
      amount: 1900,
      interval: "month",
      trial_period_days: 0,
      billing_scheme: "per_seat",
    },
  },
  {
    id: productsMap.premium?.id ?? '',
    name: "Premium",
    plan: {
      id: productsMap.premium?.default_price ?? '',
      currency: "USD",
      amount: 2500,
      interval: "month",
      trial_period_days: 0,
      billing_scheme: "per_seat",
    },
  },
  {
    id: productsMap.advanced?.id ?? '',
    name: "Advanced",
    plan: {
      id: productsMap.advanced?.default_price ?? '',
      currency: "USD",
      amount: 3900,
      interval: "month",
      trial_period_days: 0,
      billing_scheme: "per_seat",
    },
  },
// Filter out any products that don't have required IDs
].filter(product => product.id && product.plan.id);
  
      const productsDataConfigResult = {
        provider: "stripe",
        products: productsDataConfigBase.map((product) => ({
          id: product.id,
          name: product.name,
          description: "",
          currency: product.plan.currency,
          badge: product.name,
          plans: [{
            name: product.name,
            id: product.plan.id,
            trialDays: product.plan.trial_period_days,
            paymentType: "recurring",
            interval: product.plan.interval,
            lineItems: [
              {
                id: product.plan.id,
                name: product.name,
                cost: product.plan.amount / 100, 
                type: product.plan.billing_scheme,
              }
            ]
          }],
          features: featuresByProduct[product.name.toLowerCase() as keyof typeof featuresByProduct],
        })),
      };
  
      setProductsDataConfig(productsDataConfigResult);
      setLastProductsFetch(now);
    } catch (error) {
      console.error("Error fetching products: ", error);
      setErrorMessage("Error loading products");
    } finally {
      setLoading(false);
    }
  }, [lastProductsFetch, productsDataConfig]);

  const updateSubscriptionContext = async (): Promise<void> => {
    setLoading(true);
    setError(false);
    try {
      const result  = await getSubscriptionByOrganizationId();
      setSubscription(result);
      const responseSubscription = await fetch(`/api/stripe/get-subscription?subscriptionId=${encodeURIComponent(result?.id ?? "")}`, {
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

      const responseProduct = await fetch(`/api/stripe/get-product?productId=${encodeURIComponent(dataSubscription?.plan?.product ?? "")}`, {
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

      void fetchInvoices(result?.billing_customer_id ?? "");
      void fetchUpcomingInvoice(result?.billing_customer_id ?? "");
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
      const result = await getSubscriptionByOrganizationId();
  
      const responseSubscriptionsByCustomer = await fetch(`/api/stripe/get-subscription-by-customer?customerId=${encodeURIComponent(result?.billing_customer_id ?? "")}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!responseSubscriptionsByCustomer.ok) {
        throw new Error('Failed to upgrade subscription');
      }
  
      const dataSubscriptionsByCustomer = await responseSubscriptionsByCustomer.json() as {
        id?: string;
        billing_customer_id?: string;
        status?: "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "incomplete" | "incomplete_expired" | "paused";
      }[];
  
      if (dataSubscriptionsByCustomer.length > 1) {
        // Usar Promise.all en lugar de forEach para manejar operaciones asíncronas
        await Promise.all(dataSubscriptionsByCustomer.map(async (subscription) => {
          if (subscription.id && subscription.id !== result?.id) {
            await updateSubscription({
              id: subscription.id,
            });
          }
        }));
  
        // Cancel the other subscription
        if (result?.id) {
          const responseCancelSubscription = await fetch(`/api/stripe/cancel-subscription?subscriptionId=${encodeURIComponent(result.id)}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!responseCancelSubscription.ok) {
            throw new Error('Failed to upgrade subscription');
          }
          await updateSubscriptionContext();
        }
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = () => {
    if (!hasFetched) {
      void updateSubscriptionContext();
      void fetchProducts();
      setHasFetched(true);
    }
  };

  fetchData();
  }, [hasFetched]);

  return {
    subscription,
    productsDataConfig,
    subscriptionFetchedStripe,
    productSubscription,
    invoices,
    showUpgradeComponent,
    upcomingInvoice,
    totalBilled,
    loading,
    error,
    errorMessage,
    accountBillingTab,
    setAccountBillingTab,
    updateSubscriptionContext,
    fetchInvoices,
    fetchUpcomingInvoice,
    setShowUpgradeComponent,
    upgradeSubscription,
  };
};

export default useBilling;
