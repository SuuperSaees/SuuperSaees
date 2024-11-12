'use client';

import { useCallback, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Database } from '~/lib/database.types';
import { Service } from '~/lib/services.types';
import { getBriefs } from '~/team-accounts/src/server/actions/briefs/get/get-brief';
import { getStripeAccountID } from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { createUrlForCheckout } from '~/team-accounts/src/server/actions/services/create/create-token-for-checkout';
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
    queryFn: async () => await getBriefs(),
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
      const data: { email: string | null } = await response.json();
      setHasTheEmailAssociatedWithStripe(!!data.email);
    }
  }, [userRole]);

  const handleCheckout = async (
    priceId: string,
    stripeId: string,
    service: Service.Type,
    organizationId: string,
  ) => {
    try {
      const sessionUrl = await createUrlForCheckout({
        stripeId,
        priceId,
        service,
        organizationId,
      });

      navigator.clipboard
        .writeText(sessionUrl)
        .then(() => {
          toast.success('URL copiado en el portapapeles');
        })
        .catch((err) => {
          toast.error('Error al copiar al portapapeles', {
            description: err.message,
          });
          console.error('Error al copiar al portapapeles:', err);
        });
    } catch (error) {
      toast.error('Error creating checkout URL', {
        description: error?.message,
      });
      console.error(error);
    }
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
