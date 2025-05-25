'use client';

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { type RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { useOrdersSubscriptionsHandlers } from '~/hooks/use-orders-subscriptions-handlers';
import { useRealtime } from '~/hooks/use-realtime';
import { type Order } from '~/lib/order.types';
import { getOrders } from '~/team-accounts/src/server/actions/orders/get/get-order';

import {
  type OrdersContextType,
  type OrdersProviderProps,
  type PaginatedOrdersResponse,
} from './orders-context.types';

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
  const [searchTerm, setSearchTerm] = useState('');

  const { organization, workspace: userWorkspace } = useUserWorkspace();
  const target = userWorkspace.role?.includes('agency') ? 'agency' : 'client';
  // Stable query key that includes pagination parameters and search
  const queryKey = useMemo(() => {
    const key = ['orders', { page: currentPage, limit, search: searchTerm }];
    return key;
  }, [currentPage, limit, searchTerm]);

  // Stable query function
  const queryFn = useCallback(() => {
    const promise = getOrders(organization.id ?? '', target, true, {
      pagination: {
        page: currentPage,
        limit: limit,
      },
      search: searchTerm ? { term: searchTerm } : undefined,
    });

    return promise;
  }, [currentPage, limit, searchTerm, organization.id, target]);

  const ordersQuery = useQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    initialData: currentPage === 1 && limit === 20 && !searchTerm ? initialOrders : undefined,
    placeholderData: keepPreviousData, // This is the key for smooth pagination!
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
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
      const currentData = queryClient.getQueryData(
        queryKey,
      ) as PaginatedOrdersResponse;

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
  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || (totalPages && page > totalPages)) return;

      // Just change the page state - React Query handles the rest!
      setCurrentPage(page);
    },
    [totalPages],
  );

  // Function to update rows per page
  const updateLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Function to handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Function to load the next page (cursor-based)
  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || !nextCursor) return;

    try {
      // For cursor-based, we need to append data, so we use manual fetching
      const nextPageData = await getOrders(
        organization.id ?? '',
        target,
        true,
        {
          pagination: {
            cursor: nextCursor,
            limit: limit,
          },
          search: searchTerm ? { term: searchTerm } : undefined,
        },
      );

      // Get current data
      const currentData = queryClient.getQueryData(
        queryKey,
      ) as PaginatedOrdersResponse;

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
  }, [
    hasNextPage,
    nextCursor,
    limit,
    queryClient,
    queryKey,
    organization.id,
    target,
    searchTerm,
  ]);

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

    // Search function and state
    handleSearch,
    searchTerm,
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
