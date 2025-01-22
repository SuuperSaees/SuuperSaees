'use client';

import { Dispatch, SetStateAction } from 'react';

import { Order } from '~/lib/order.types';

import { useUserOrderActions } from './user-order-actions';

interface UseOrdersActionHandlerProps {
  orders: Order.Response[];
  setOrders: Dispatch<SetStateAction<Order.Response[]>>;
  agencyId?: Order.Type['agency_id'];
}

const useOrdersActionHandler = ({ agencyId }: UseOrdersActionHandlerProps) => {
  const { updateOrderMutation } = useUserOrderActions(
    'status',
    undefined,
    undefined,
  );

  const handleUpdateOrder = async (
    data: Order.Response,
    property?: string,
    targetOrderId?: Order.Type['id'],
  ) => {
    try {
      const updateValue = property
        ? {
            [property as keyof Order.Response]:
              data[property as keyof Order.Response],
          }
        : data;
      // await updateOrder(data.id, updateValue);
      await updateOrderMutation.mutateAsync({
        data: updateValue,
        id: data.id,
        agencyId,
        targetOrderId,
      });
    } catch (error) {
      console.error('Error updating orders data:', error);
    }
  };
  return {
    handleUpdateOrder,
  };
};

export default useOrdersActionHandler;
