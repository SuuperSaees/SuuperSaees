'use client';

import { useCallback, useEffect, useState } from 'react';



import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';



import { BillingAccounts } from '~/lib/billing-accounts.types';
import { Database } from '~/lib/database.types';
import { Service } from '~/lib/services.types';
import { getBriefs } from '~/team-accounts/src/server/actions/briefs/get/get-brief';
import { getStripeAccountID } from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { getOrganization } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';
import { createUrlForCheckout } from '~/team-accounts/src/server/actions/services/create/create-token-for-checkout';
// import { createUrlForCheckout } from '~/team-accounts/src/server/actions/services/create/create-token-for-checkout';
import { getServicesByOrganizationId } from '~/team-accounts/src/server/actions/services/get/get-services-by-organization-id';


interface UseStripeActions {
  userRole: Database['public']['Tables']['accounts_memberships']['Row']['account_role'];
  // view: 'briefs' | 'services'; // activate to improve performance => this will make the query only when the view is active // one call per view
}

export function useStripeActions({ userRole }: UseStripeActions) {
  const [hasTheEmailAssociatedWithStripe, setHasTheEmailAssociatedWithStripe] =
    useState<boolean>(false);

  const servicesQueryData = useQuery({
    queryKey: ['services'],
    queryFn: async () => await getServicesByOrganizationId(),
  });

  const briefsQueryData = useQuery({
    queryKey: ['briefs'],
    queryFn: async () => await getBriefs({ includes: ['services'] }),
    // enabled: view === 'briefs',
  });

  const services = servicesQueryData.data?.products ?? [];
  const briefs = briefsQueryData.data ?? [];
  const servicesAreLoading =
    servicesQueryData.isPending || servicesQueryData.isLoading;
  const servicesError = !!servicesQueryData.error;
  // briefLoading
  const briefsAreLoading =
    briefsQueryData.isPending || briefsQueryData.isLoading;
  const briefsError = !!briefsQueryData.error;

  const fetchAccountStripeConnect = useCallback(async () => {
    if (userRole === 'agency_owner') {
      // const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const { stripeId } = await getStripeAccountID();
      const response = await fetch(
        `/api/stripe/get-account?accountId=${encodeURIComponent(stripeId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) {
        console.error('Failed to fetch account data from Stripe');
      }
      const data: { email: string | null } = await response.clone().json();
      setHasTheEmailAssociatedWithStripe(!!data.email);
    }
  }, [userRole]);

  const createCheckoutMutation = useMutation({
    mutationFn: createUrlForCheckout,
    onSuccess: (sessionUrl: string) => {
      if (!document.hasFocus()) {
        window.focus();
      }
      navigator.clipboard.writeText(sessionUrl).catch((error) => {
        console.error('Error copying checkout URL to clipboard:', error);
      });
      toast.success('Checkout URL copied to clipboard');
    },
    onError: (error: Error) => {
      console.error('Checkout error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      toast.error('Error creating checkout URL', {
        description: error?.message,
      });
    },
  });

  const handleCheckout = async (
    service: Service.Relationships.Billing.BillingService,
    paymentMethods: BillingAccounts.PaymentMethod[],
    stripeId: string,
    organizationId?: string,
  ) => {
    const { stripeId: stripeIdBillingAccount } = stripeId ? { stripeId } : await getStripeAccountID();
    organizationId = organizationId ? organizationId : (await getOrganization()).id;
    if (!service.billing_services || !service || !organizationId) {
      console.error('Missing required parameters:', {
        hasService: !!service,
        hasOrgId: !!organizationId,
      });
      throw new Error('Missing required parameters');
    }

    createCheckoutMutation.mutate({
      stripeId: stripeIdBillingAccount,
      priceId:
        service.billing_services.find(
          (billingService) => billingService.provider === 'stripe',
        )?.provider_id ?? '',
      service,
      organizationId,
      paymentMethods,
      baseUrl: typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL ?? ''),
    });
  };

  useEffect(() => {
    void fetchAccountStripeConnect();
  }, [fetchAccountStripeConnect]);

  return {
    briefs,
    briefsAreLoading,
    briefsError,
    services,
    hasTheEmailAssociatedWithStripe,
    servicesAreLoading,
    servicesError,
    fetchAccountStripeConnect,
    handleCheckout,
  };
}