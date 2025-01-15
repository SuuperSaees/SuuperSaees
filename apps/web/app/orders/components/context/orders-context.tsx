'use client';

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { useRealtime } from '~/hooks/use-realtime';
import { Order } from '~/lib/order.types';

import { OrdersContextType, OrdersProviderProps } from './orders-context.types';
import { useQueryClient } from '@tanstack/react-query';

// Create a generic context
const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Context provider

export const OrdersProvider = ({
  children,
  initialOrders,
}: OrdersProviderProps) => {
  const [orders, setOrders] = useState<Order.Response[]>(initialOrders ?? []);
  const queryClient = useQueryClient()
  queryClient.setQueryData(['orders'], initialOrders)
  const value = {
    orders,
    setOrders,
  };
  // console.log('ordersv1', orders)
  // Define the handleSubscriptions function to handle realtime changes and update the state
  const handleSubscriptions = createSubscriptionHandler<Order.Response>({
    onAfterUpdate(payload) {
      const newOrder = payload as Order.Response;
      const itemAlreadyExists = orders.find(
        (order) => order.id === newOrder.id,
      );

      if (!itemAlreadyExists) {
        // don't allow the insertection => remove the item
        setOrders((prevOrders) => {
          const newOrders = prevOrders.filter(
            (order) => order.id !== newOrder.id,
          );
          // console.log('newOrders', newOrders);
          return newOrders;
        });
      }
    },
  });

  // Use the useRealtime hook to subscribe to realtime changes
  useRealtime(
    [
      {
        tableName: 'orders_v2',
        currentData: orders,
        setData: setOrders as Dispatch<
          SetStateAction<Order.Response | Order.Response[]>
        >,
      },
    ],
    {
      channelName: 'orders-changes',
      schema: 'public',
    },
    handleSubscriptions,
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};

export const useOrdersContext = () => {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error('useOrdersContext must be used within a OrdersProvider');
  }

  return context;
};
