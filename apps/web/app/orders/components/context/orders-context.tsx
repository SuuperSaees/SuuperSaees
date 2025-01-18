'use client';

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

import { type RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { useQueryClient } from '@tanstack/react-query';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { useOrdersSubscriptionsHandlers } from '~/hooks/use-orders-subscriptions-handlers';
import { useRealtime } from '~/hooks/use-realtime';
import { type Order } from '~/lib/order.types';

import {
  type OrdersContextType,
  type OrdersProviderProps,
} from './orders-context.types';

/**
 * Context for managing orders state and realtime updates
 * Undefined by default - will be populated by the provider
 */
const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

/**
 * Provider component for Orders context
 * Manages orders state and handles realtime updates
 */
export const OrdersProvider = ({
  children,
  initialOrders = [],
  agencyMembers,
}: OrdersProviderProps) => {
  const [orders, setOrders] = useState<Order.Response[]>(initialOrders);
  const queryClient = useQueryClient();

  // Initialize query cache
  queryClient.setQueryData(['orders'], initialOrders);

  const { handleAssigneesChange } = useOrdersSubscriptionsHandlers(
    orders,
    setOrders,
    agencyMembers,
  );
  // Create subscription handler for realtime updates
  const handleSubscriptions = createSubscriptionHandler<Order.Response>({
    onBeforeUpdate: (payload) => {
      if (payload.table === 'order_assignations') {
        return handleAssigneesChange(
          payload as RealtimePostgresChangesPayload<Order.Assignee>,
        );
      }
    },
    onAfterUpdate: (payload) => {
      const newOrder = payload as Order.Response;
      const orderExists = orders.some((order) => order.id === newOrder.id);

      if (!orderExists) {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== newOrder.id),
        );
      }
    },
  });

  // Configure realtime subscriptions
  const realtimeConfig = {
    channelName: 'orders-changes',
    schema: 'public',
  };

  const tables = [
    {
      tableName: 'orders_v2',
      currentData: orders,
      setData: setOrders as Dispatch<
        SetStateAction<Order.Response | Order.Response[]>
      >,
    },
    {
      tableName: 'order_assignations',
      currentData: orders,
      setData: setOrders as Dispatch<
        SetStateAction<Order.Response | Order.Response[]>
      >,
    },
  ];

  // Subscribe to realtime updates
  useRealtime(tables, realtimeConfig, handleSubscriptions);

  const contextValue = { orders, setOrders, agencyMembers };

  return (
    <OrdersContext.Provider value={contextValue}>
      {children}
    </OrdersContext.Provider>
  );
};

/**
 * Hook to access the Orders context
 * Must be used within an OrdersProvider
 * @throws Error if used outside of OrdersProvider
 */
export const useOrdersContext = (): OrdersContextType => {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error('useOrdersContext must be used within an OrdersProvider');
  }

  return context;
};
