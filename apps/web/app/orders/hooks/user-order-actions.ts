'use client';

import { useMutation } from '@tanstack/react-query';
import { updateOrderAssigns } from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import {
  logOrderActivities,
  updateOrder,
} from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function useUserOrderActions() {
  const { t } = useTranslation('orders');

  const orderDateMutation = useMutation({
    mutationFn: async ({
      due_date,
      orderId,
    }: {
      due_date: string;
      orderId: number;
    }) => {
      return updateOrder(orderId, { due_date });
    },
    onSuccess: async (response) => {
      toast.success('Success', {
        description: t('success.orders.orderDateUpdated'),
      });
      await logOrderActivities(
        response.order.id,
        response.order,
        response.user?.id ?? '',
        response.user?.user_metadata?.name ??
          response.user?.user_metadata?.email ??
          '',
        undefined,
        ['due_date'],
      );
    },
    onError: () => {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderDate'),
      });
    },
  });

  const orderAssignsMutation = useMutation({
    mutationFn: ({
      agencyMemberIds,
      orderId,
    }: {
      agencyMemberIds: string[];
      orderId: number;
    }) => {
      return updateOrderAssigns(orderId, agencyMemberIds);
    },
    onSuccess: () => {
      toast.success('Success', {
        description: t('success.orders.orderAssigneesUpdated'),
      });
    },
    onError: () => {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderAssigneees'),
      });
    },
  });

  return {
    orderDateMutation,
    orderAssignsMutation,
  };
}
