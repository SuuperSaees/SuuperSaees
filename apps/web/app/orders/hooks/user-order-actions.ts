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
import { User } from '~/lib/user.types';

export function useUserOrderActions(
  propertyUpdated?: keyof Order.Update,
  successTranslateActionName?: string,
  errorTranslateActionName?: string,
  orders?: Order.Response[],
  setOrders?: React.Dispatch<React.SetStateAction<Order.Response[]>>,
  agencyMembers?: User.Response[],
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
    }: {
      data: Order.Update;
      id: number;
      userId?: string;
    }) => {
      const { order: updatedOrder } = await updateOrder(id, data, userId);
      return { updatedOrder };
    },
    onMutate: async (newOrder) => {
      // console.log('newOrder', newOrder)
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orders'] });

      // Snapshot the previous value
      const previousOrders: Order.Response[] =
        queryClient.getQueryData(['orders']) ?? [];
      // console.log('previousOrders', previousOrders)
      // Optimistically update to the new value
      // queryClient.setQueryData(['orders'], (old: Order.Response[]) =>
      //   old.map(order =>
      //     order.id === newOrder.id ? { ...order, ...newOrder } : order
      //   )

      // );
      // console.log('newOrder', newOrder)
      setOrders &&
        setOrders((old) =>
          old.map((order) =>
            order.id === newOrder.id ? { ...order, ...newOrder.data } : order,
          ),
        );

      // Return the snapshot in case of rollback
      return { previousOrders };
    },
    onSuccess: async ({
      updatedOrder,
    }: {
      updatedOrder: Order.Type | null;
    }) => {
      console.log('updatedOrder', updatedOrder);
      setOrders &&
        setOrders((old) =>
          old.map((order) =>
            order.id === updatedOrder.id
              ? { ...order, ...updatedOrder }
              : order,
          ),
        );
      toast.success('Success', {
        description: t(
          successTranslateActionName ?? 'success.orders.orderUpdated',
        ),
      });
      const fields: (keyof Order.Update)[] | undefined = propertyUpdated
        ? [propertyUpdated]
        : undefined;

      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      // await logOrderActivities(
      //   updatedOrder?.id ?? 0,
      //   updatedOrder ?? {},
      //   userWorkspace?.id ?? '',
      //   userWorkspace?.name ?? '',
      //   undefined,
      //   fields,
      // );
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      // queryClient.setQueryData(['orders'], previousOrders);
      setOrders &&
        setOrders &&
        context?.previousOrders &&
        setOrders(context.previousOrders);
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
    onSuccess: async (newAssignees) => {
      console.log('assignees', newAssignees);
      toast.success('Success', {
        description: t('success.orders.orderAssigneesUpdated'),
      });
      // if (setOrders && orders && agencyMembers) {
      //   const currentOrder = orders.find(
      //     (order) => order.id === newAssignees?.[0]?.order_id,
      //   );
      //   const currentAssignees = currentOrder?.assigned_to ?? [];
      //   const newAssigneesIds = newAssignees?.map(
      //     (assignee) => assignee.agency_member_id,
      //   );
      //   const newUsers = agencyMembers
      //     .map((member) => {
      //       if (newAssigneesIds.includes(member.id)) {
      //         return { agency_member: member };
      //       }
      //     })
      //     .filter((nu) => nu !== undefined);

      //   newUsers &&
      //     setOrders((prevOrders) => {
      //       const newOrders = prevOrders.map((order) =>
      //         order.id === currentOrder?.id
      //           ? { ...order, assigned_to: currentAssignees.concat(newUsers) }
      //           : order,
      //       );
      //       return newOrders;
      //     });
      // }
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
