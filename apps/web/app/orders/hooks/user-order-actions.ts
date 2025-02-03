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
  // setOrders?: React.Dispatch<React.SetStateAction<Order.Response[]>>,
  queryKey = ['orders'],
) {
  const { t } = useTranslation('orders');
  const queryClient = useQueryClient();
  // Replace useState with useQuery for better cache management

  const { workspace: userWorkspace } = useUserWorkspace();

  // API Actions
  const updateOrderMutation = useMutation({
    mutationFn: async ({
      data,
      id,
      userId,
      agencyId,
      targetOrderId,
    }: {
      data: Order.Update;
      id: number;
      userId?: string;
      agencyId?: Order.Type['agency_id'];
      targetOrderId?: Order.Type['id'];
    }) => {
      const { order: updatedOrder } = await updateOrder(
        id,
        data,
        userId,
        agencyId,
        targetOrderId,
      );
      return { updatedOrder };
    },
    // onMutate: async (newOrder) => {
    //   // console.log('newOrder', newOrder)
    //   // Cancel any outgoing refetches
    //   await queryClient.cancelQueries({ queryKey: ['orders'] });

    //   // Snapshot the previous value
    //   const previousOrders: Order.Response[] =
    //     queryClient.getQueryData(['orders']) ?? [];

    //   // Optimistically update to the new value
    //   queryClient.setQueryData(['orders'], previousOrders)

    //   // Return the snapshot in case of rollback
    //   return { previousOrders };
    // },
    onSuccess: async ({
      updatedOrder,
    }: {
      updatedOrder: Order.Type | null;
    }) => {
      // console.log('updatedOrder', updatedOrder);

      updatedOrder
        ? queryClient.setQueryData(queryKey, (old: Order.Response[]) =>
            old.map((order) =>
              order.id === updatedOrder.id
                ? { ...order, ...updatedOrder }
                : order,
            ),
          )
        : await queryClient.invalidateQueries({ queryKey: queryKey });
      await queryClient.invalidateQueries({ queryKey: queryKey });

      toast.success('Success', {
        description: t(
          successTranslateActionName ?? 'success.orders.orderUpdated',
        ),
      });

      const fields: (keyof Order.Update)[] | undefined = propertyUpdated
        ? [propertyUpdated]
        : undefined;

      await logOrderActivities(
        updatedOrder?.id ?? 0,
        updatedOrder ?? {},
        userWorkspace?.id ?? '',
        userWorkspace?.name ?? '',
        undefined,
        fields,
      );
    },
    onError: async (_error, _variables) => {
      // Rollback on error
      // queryClient.setQueryData(['orders'], previousOrders);
      // setOrders &&
      //   setOrders &&
      //   context?.previousOrders &&
      //   setOrders(context.previousOrders);

      await queryClient.invalidateQueries({ queryKey: queryKey });
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
      const order = response.order as Order.Response;
      order &&
        (await logOrderActivities(
          order.id,
          order,
          response.user?.id ?? '',
          response.user?.user_metadata?.name ??
            response.user?.user_metadata?.email ??
            '',
          undefined,
          ['due_date'],
        ));
      await queryClient.invalidateQueries({ queryKey: queryKey });
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
      // console.log('assignees', newAssignees);
      toast.success('Success', {
        description: t('success.orders.orderAssigneesUpdated'),
      });

      await queryClient.invalidateQueries({ queryKey: queryKey });
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
