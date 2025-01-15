'use client';

import { Dispatch, SetStateAction } from 'react';

import { Order } from '~/lib/order.types';

import { useUserOrderActions } from './user-order-actions';

interface UseOrdersActionHandlerProps {
  orders: Order.Response[];
  setOrders: Dispatch<SetStateAction<Order.Response[]>>;
}

const useOrdersActionHandler = ({
  orders,
  setOrders,
}: UseOrdersActionHandlerProps) => {
  const { updateOrderMutation } = useUserOrderActions(
    undefined,
    undefined,
    undefined,
    orders,
    setOrders,
  );
  
  const handleUpdateOrder = async (data: Order.Response, property?: string) => {
    try {
      console.log('Updating orders data...', data);
      const updateValue = property
        ? {
            [property as keyof Order.Response]:
              data[property as keyof Order.Response],
            position: data.position,
          }
        : data;
      // await updateOrder(data.id, updateValue);
      await updateOrderMutation.mutateAsync({ data: updateValue, id: data.id });
    } catch (error) {
      console.error('Error updating orders data:', error);
    }
  };
  return {
    handleUpdateOrder,
  };
};

export default useOrdersActionHandler;
