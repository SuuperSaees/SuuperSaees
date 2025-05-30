'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BillingAccounts } from '~/lib/billing-accounts.types';
import { Service } from '~/lib/services.types';
import { getBriefs } from '~/team-accounts/src/server/actions/briefs/get/get-brief';
import { createUrlForCheckout } from '~/team-accounts/src/server/actions/services/create/create-token-for-checkout';
import { getServicesByOrganizationId } from '~/server/actions/services/get-services';


export function useStripeActions() {
  const servicesQueryData = useQuery({
    queryKey: ['services'],
    queryFn: async () => await getServicesByOrganizationId({
      limit: 1,
    }),
  });

  const briefsQueryData = useQuery({
    queryKey: ['briefs'],
    queryFn: async () => await getBriefs(),
    // only enable if services are loaded
    enabled: !!servicesQueryData.data,
  });

  const services = servicesQueryData.data?.data ?? [];
  const briefs = briefsQueryData.data ?? [];
  const servicesAreLoading =
    servicesQueryData.isPending || servicesQueryData.isLoading;
  const servicesError = !!servicesQueryData.error;
  // briefLoading
  const briefsAreLoading =
    briefsQueryData.isPending || briefsQueryData.isLoading;
  const briefsError = !!briefsQueryData.error;

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
      primaryOwnerId: ''
    });
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Error creating checkout URL');
  }
  },  [createCheckoutMutation]);

  return {
    briefs,
    briefsAreLoading,
    briefsError,
    services,
    servicesAreLoading,
    servicesError,
    handleCheckout,
  };
}