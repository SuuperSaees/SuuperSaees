'use client';

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState,
  useMemo,
} from 'react';

import { type RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { useOrdersSubscriptionsHandlers } from '~/hooks/use-orders-subscriptions-handlers';
import { useRealtime } from '~/hooks/use-realtime';
import { type Order } from '~/lib/order.types';

import {
  type OrdersContextType,
  type OrdersProviderProps,
  type PaginatedOrdersResponse,
} from './orders-context.types';
import { getOrders } from '~/team-accounts/src/server/actions/orders/get/get-order';

/**
 * Context for managing orders state and realtime updates
 * Undefined by default - will be populated by the provider
 */
const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

/**
 * Provider component for Orders context
 * Manages orders state and handles realtime updates with pagination support
 */
export const OrdersProvider = ({
  children,
  agencyMembers,
  agencyId,
  initialOrders,
}: OrdersProviderProps) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Stable query key that includes pagination parameters
  const queryKey = useMemo(() => {
    const key = ['orders', { page: currentPage, limit }];
    console.log('🔑 Query key created:', key);
    console.log('🔑 Current page:', currentPage, 'Current limit:', limit);
    return key;
  }, [currentPage, limit]);

  // Stable query function
  const queryFn = useCallback(() => {
    console.log('🚀 Query function called with page:', currentPage, 'limit:', limit);
    console.log('🚀 Making request to getOrders...');
    const promise = getOrders(true, {
      pagination: {
        page: currentPage,
        limit: limit,
      },
    });
    console.log('🚀 Request promise:', promise);
    return promise;
  }, [currentPage, limit]);

  const ordersQuery = useQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    initialData: (currentPage === 1 && limit === 20) ? initialOrders : undefined,
    placeholderData: keepPreviousData, // This is the key for smooth pagination!
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (was cacheTime)
  });

  // Extract pagination data from the response
  const ordersData = ordersQuery.data;
  const orders = ordersData?.data ?? [];
  const nextCursor = ordersData?.nextCursor ?? null;
  const count = ordersData?.count ?? null;
  const hasNextPage = ordersData?.pagination?.hasNextPage ?? false;
  const totalPages = ordersData?.pagination?.totalPages ?? null;
  const serverCurrentPage = ordersData?.pagination?.currentPage ?? null;
  const isOffsetBased = ordersData?.pagination?.isOffsetBased ?? false;
  const ordersAreLoading = ordersQuery.isLoading || ordersQuery.isPending;
  const isLoadingMore = ordersQuery.isFetching; // Use isFetching for loading indicator

  const setOrders = useCallback(
    (
      updater:
        | Order.Response[]
        | ((prev: Order.Response[]) => Order.Response[]),
    ) => {
      // Get the current data from the query cache
      const currentData = queryClient.getQueryData(queryKey) as PaginatedOrdersResponse;
      
      if (!currentData) return;

      // If updater is a function, call it with current orders
      // If it's a direct value, use it as is
      const newOrders =
        typeof updater === 'function' ? updater(currentData.data) : updater;

      // Update the query cache with new orders, preserving pagination metadata
      const updatedData: PaginatedOrdersResponse = {
        ...currentData,
        data: newOrders,
      };

      queryClient.setQueryData(queryKey, updatedData);
    },
    [queryClient, queryKey],
  );

  // Function to go to a specific page (offset-based) - MUCH SIMPLER!
  const goToPage = useCallback((page: number) => {
    if (page < 1 || (totalPages && page > totalPages)) return;
    
    // Just change the page state - React Query handles the rest!
    setCurrentPage(page);
  }, [totalPages]);

  // Function to update rows per page
  const updateLimit = useCallback((newLimit: number) => {
    console.log('🔥 updateLimit called with:', newLimit);
    console.log('🔥 Current limit:', limit);
    console.log('🔥 Current page:', currentPage);
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing page size
    console.log('🔥 After updateLimit: limit will be', newLimit, 'page will be 1');
  }, [limit, currentPage]);

  // Function to load the next page (cursor-based)
  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || !nextCursor) return;
    
    try {
      // For cursor-based, we need to append data, so we use manual fetching
      const nextPageData = await getOrders(true, {
        pagination: {
          cursor: nextCursor,
          limit: limit,
        },
      });

      // Get current data
      const currentData = queryClient.getQueryData(queryKey) as PaginatedOrdersResponse;
      
      if (currentData && nextPageData.data.length > 0) {
        // Merge new data with existing data
        const mergedData: PaginatedOrdersResponse = {
          data: [...currentData.data, ...nextPageData.data],
          nextCursor: nextPageData.nextCursor,
          count: nextPageData.count,
          pagination: nextPageData.pagination,
        };

        queryClient.setQueryData(queryKey, mergedData);
      }
    } catch (error) {
      console.error('Error loading next page:', error);
    }
  }, [hasNextPage, nextCursor, limit, queryClient, queryKey]);

  const { handleAssigneesChange } = useOrdersSubscriptionsHandlers(
    orders,
    setOrders,
    agencyMembers,
  );
  console.log('orders', orders);
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

  const contextValue = {
    orders,
    ordersAreLoading,
    agencyMembers,
    agencyId,
    queryKey,
    setOrders,
    
    // Pagination properties
    nextCursor,
    count,
    hasNextPage,
    totalPages,
    currentPage: serverCurrentPage ?? currentPage,
    isOffsetBased,
    limit,
    
    // Pagination functions
    goToPage,
    loadNextPage,
    updateLimit,
    isLoadingMore,
  };

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
