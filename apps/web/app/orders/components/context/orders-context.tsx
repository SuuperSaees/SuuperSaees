'use client';

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
} from 'react';

import { type RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { useOrdersSubscriptionsHandlers } from '~/hooks/use-orders-subscriptions-handlers';
import { useRealtime } from '~/hooks/use-realtime';
import { type Order } from '~/lib/order.types';
import { getOrders } from '~/team-accounts/src/server/actions/orders/get/get-order';

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
  agencyMembers,
  agencyId,
}: OrdersProviderProps) => {
  // const [orders, setOrders] = useState<Order.Response[]>(initialOrders);
  const queryClient = useQueryClient();
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders(true),
  });
  const orders = ordersQuery.data ?? [];
  const ordersAreLoading = ordersQuery.isLoading || ordersQuery.isPending;
  
  const setOrders = useCallback(
    (
      updater:
        | Order.Response[]
        | ((prev: Order.Response[]) => Order.Response[]),
    ) => {
      // Get the current orders from the query cache
      const currentOrders = queryClient.getQueryData([
        'orders',
      ]) as Order.Response[];

      // If updater is a function, call it with current orders
      // If it's a direct value, use it as is
      const newOrders =
        typeof updater === 'function' ? updater(currentOrders) : updater;

      // Update the query cache with new orders
      queryClient.setQueryData(['orders'], newOrders);
    },
    [queryClient],
  );

  // Initialize query cache
  // queryClient.setQueryData(['orders'], initialOrders);

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

  const contextValue = { orders, ordersAreLoading, agencyMembers, agencyId, setOrders};

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
