'use client';

import { useState, useEffect } from 'react';
import { getSubscriptionByOrganizationId } from '../../../../../../packages/features/team-accounts/src/server/actions/subscriptions/get/get-subscription';
import { updateSubscription } from '../../../../../../packages/features/team-accounts/src/server/actions/subscriptions/update/update-subscription';
import { BillingProviderSchema } from '@kit/billing';
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
  const [totalBilled, setTotalBilled] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasFetched, setHasFetched] = useState(false);

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

  const fetchProducts = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/stripe/suuper-products`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Error fetching products");
      }
      const data = await response.json();
      const provider = BillingProviderSchema.parse(
        process.env.NEXT_PUBLIC_BILLING_PROVIDER,
      );
      const productsDataConfigBase = [
        {
          id: data?.find((productCurrent: { name: string; id: string }) => productCurrent?.name.toLowerCase() === "standard")?.id,
          name: "Standard",
          plan: {
            id: data?.find((productCurrent: { name: string; default_price: string; }) => productCurrent?.name.toLowerCase() === "standard")?.default_price,
            currency: "USD",
            amount: 2500,
            interval: "month",
            trial_period_days: 0,
            billing_scheme: "per_seat",
          },
        },
        {
          id: data?.find((productCurrent: { name: string; id: string }) => productCurrent?.name.toLowerCase() === "premium")?.id,
          name: "Premium",
          plan: {
            id: data?.find((productCurrent: { name: string; default_price: string; }) => productCurrent?.name.toLowerCase() === "premium")?.default_price,
            currency: "USD",
            amount: 4500,
            interval: "month",
            trial_period_days: 0,
            billing_scheme: "per_seat",
          },
        },
        {
          id: data?.find((productCurrent: { name: string; id: string }) => productCurrent?.name.toLowerCase() === "enterprise")?.id,
          name: "Enterprise",
          plan: {
            id: data?.find((productCurrent: { name: string; default_price: string; }) => productCurrent?.name.toLowerCase() === "enterprise")?.default_price,
            currency: "USD",
            amount: 7500,
            interval: "month",
            trial_period_days: 0,
            billing_scheme: "per_seat",
          },
        },
      ];
      
      const productsDataConfigResult = {
        provider,
        products: productsDataConfigBase.map((product: { id: any; name: any; plan: { currency: any; id: any; trial_period_days: any; interval: any; amount: number; billing_scheme: any; }; }) => ({
          id: product.id,
          name: product.name,
          description: data?.find((productCurrent: { name: string; id: string }) => productCurrent?.name.toLowerCase() === product.name.toLowerCase())?.description,
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
          features: data?.find((productCurrent: { name: string; id: string }) => productCurrent?.name.toLowerCase() === product.name.toLowerCase())?.description.split('.'),
        })),
      };

      setProductsDataConfig(productsDataConfigResult);
    } catch (error) {
      console.error("Error fetching products: ", error);
      setErrorMessage("Error loading products");
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

      void fetchInvoices(result?.billing_customer_id ?? "");
      void fetchUpcomingInvoice(result?.billing_customer_id ?? "");
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const upgradeSubscription = async (): Promise<void> => { // Use this with a webhook.
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
      console.log("dataSubscriptionsByCustomer", dataSubscriptionsByCustomer);
      if (dataSubscriptionsByCustomer.length > 1) {
        let newSubscriptionId = "";
        dataSubscriptionsByCustomer.forEach((subscription: any) => {
          if (subscription.id !== result?.id) {
            newSubscriptionId = subscription.id;
            console.log("newSubscriptionId", newSubscriptionId);
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
