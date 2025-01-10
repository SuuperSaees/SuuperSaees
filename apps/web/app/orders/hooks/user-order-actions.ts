'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderAssigns } from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import {
  logOrderActivities,
  updateOrder,
} from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { Order } from '~/lib/order.types';

export function useUserOrderActions(
  propertyUpdated?: keyof Order.Update,
  successTranslateActionName?: string,
  errorTranslateActionName?: string,
) {
  const { t } = useTranslation('orders');
  const queryClient = useQueryClient();

  const { workspace: userWorkspace } = useUserWorkspace();

  // API Actions
  const updateOrderMutation = useMutation({
    mutationFn: async ({
      data,
      id,
      userId,
    }: {
      data: Order.Update;
      id: number;
      userId?: string;
    }) => {
      const { order: updatedOrder } = await updateOrder(id, data, userId);
      return { updatedOrder };
    },
    onSuccess: async ({
      updatedOrder,
    }: {
      updatedOrder: Order.Type | null;
    }) => {
      toast.success('Success', {
        description: t(
          successTranslateActionName ?? 'success.orders.orderUpdated',
        ),
      });
      const fields: (keyof Order.Update)[] | undefined = propertyUpdated
        ? [propertyUpdated]
        : undefined;

      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      await logOrderActivities(
        updatedOrder?.id ?? 0,
        updatedOrder ?? {},
        userWorkspace?.id ?? '',
        userWorkspace?.name ?? '',
        undefined,
        fields,
      );
    },
    onError: () => {
      toast.error('Error', {
        description: t(
          errorTranslateActionName ?? 'error.orders.failedToUpdatedOrder',
        ),
      });
    },
  });
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
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
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
    onSuccess: async () => {
      toast.success('Success', {
        description: t('success.orders.orderAssigneesUpdated'),
      });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderAssigneees'),
      });
    },
  });

  return {
    updateOrderMutation,
    orderDateMutation,
    orderAssignsMutation,
  };
}
