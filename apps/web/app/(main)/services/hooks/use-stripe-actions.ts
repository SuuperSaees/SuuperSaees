'use client';

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { BillingAccounts } from '~/lib/billing-accounts.types';
import { Pagination } from '~/lib/pagination';
import { Service } from '~/lib/services.types';
import { getServicesByOrganizationId } from '~/server/actions/services/get-services';
import { createUrlForCheckout } from '~/team-accounts/src/server/actions/services/create/create-token-for-checkout';
import { useDataPagination } from '../../../hooks/use-data-pagination';

interface ServiceFilters {
  [key: string]: unknown;
  searchTerm?: string;
}

interface QueryParams {
  page: number;
  limit: number;
  filters?: ServiceFilters;
}

export function useStripeActions(
  initialData: Pagination.Response<Service.Relationships.Billing.BillingService>,
  config: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  },
) {
  const {
    data: services,
    isLoading: servicesAreLoading,
    error: servicesError,
    pagination,
    query: servicesQuery,
  } = useDataPagination<Service.Relationships.Billing.BillingService, ServiceFilters>({
    queryKey: ['services'],
    queryFn: ({ page, limit, filters }: QueryParams) => 
      getServicesByOrganizationId({
        pagination: { page, limit },
        filters: filters?.searchTerm
          ? [
              {
                field: 'name',
                operator: 'ilike',
                value: filters.searchTerm,
              },
            ]
          : undefined,
      }),
    initialData,
    config: {
      limit: config.limit,
      filters: { searchTerm: config.searchTerm },
    },
  });

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

  const handleCheckout = useCallback(
    (
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
          primaryOwnerId: '',
        });
      } catch (error) {
        console.error('Checkout error:', error);
        toast.error('Error creating checkout URL');
      }
    },
    [createCheckoutMutation],
  );

  return {
    services,
    servicesAreLoading,
    servicesError,
    handleCheckout,
    servicesQuery,
    pagination,
  };
}
