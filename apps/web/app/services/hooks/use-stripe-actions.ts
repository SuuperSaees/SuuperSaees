'use client';

import { useCallback, useEffect, useState } from 'react';



import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';



import { BillingAccounts } from '~/lib/billing-accounts.types';
// import { Database } from '~/lib/database.types';
import { Service } from '~/lib/services.types';
import { getBriefs } from '~/team-accounts/src/server/actions/briefs/get/get-brief';
import { getStripeAccountID } from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { createUrlForCheckout } from '~/team-accounts/src/server/actions/services/create/create-token-for-checkout';
// import { createUrlForCheckout } from '~/team-accounts/src/server/actions/services/create/create-token-for-checkout';
import { getServicesByOrganizationId } from '~/team-accounts/src/server/actions/services/get/get-services-by-organization-id';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';


// interface UseStripeActions {
//   // userRole: Database['public']['Tables']['accounts_memberships']['Row']['account_role'];
//   // view: 'briefs' | 'services'; // activate to improve performance => this will make the query only when the view is active // one call per view
// }

export function useStripeActions() {
  const [hasTheEmailAssociatedWithStripe, setHasTheEmailAssociatedWithStripe] =
    useState<boolean>(false);
  const { workspace } = useUserWorkspace();
  const userRole = workspace?.role ?? '';

  const servicesQueryData = useQuery({
    queryKey: ['services'],
    queryFn: async () => await getServicesByOrganizationId(),
  });

  const briefsQueryData = useQuery({
    queryKey: ['briefs'],
    queryFn: async () => await getBriefs(),
    // only enable if services are loaded
    enabled: !!servicesQueryData.data,
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

  const handleCheckout = useCallback( (
    service: Service.Relationships.Billing.BillingService,
    paymentMethods: BillingAccounts.PaymentMethod[],
    stripeId: string,
    organizationId?: string,
  ) => {
    try {
      if (!service.billing_services?.length) {
        throw new Error('No billing services available');
      }
    const effectiveStripeId = stripeId;
    const effectiveOrgId = organizationId;
     if (!effectiveOrgId) {
      throw new Error('Missing required IDs');
    }

    const priceId = service.billing_services.find(
      (billingService) => billingService.provider === 'stripe',
    )?.provider_id;
     if (!priceId) {
      throw new Error('No Stripe price ID found');
    }
     createCheckoutMutation.mutate({
      stripeId: effectiveStripeId,
      priceId,
      service,
      organizationId: effectiveOrgId,
      paymentMethods,
      baseUrl: window.location.origin,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Error creating checkout URL');
  }
  },  [createCheckoutMutation]);

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