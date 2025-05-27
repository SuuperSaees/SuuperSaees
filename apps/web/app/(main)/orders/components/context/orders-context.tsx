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
import useStorageConfigs from '~/hooks/use-storage-configs';
import { type Order } from '~/lib/order.types';
import { getOrders } from '~/team-accounts/src/server/actions/orders/get/get-order';

import {
  type OrdersContextType,
  type OrdersProviderProps,
  type PaginatedOrdersResponse,
  type OrdersQueryResponse,
} from './orders-context.types';

// Configuration type for orders view
interface OrdersConfig extends Record<string, unknown> {
  rowsPerPage: number;
}

/**
 * Context for managing orders state and realtime updates
 * Undefined by default - will be populated by the provider
 */
const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

/**
 * Helper function to normalize response data
 * Converts Order.Response[] to PaginatedOrdersResponse format with proper pagination
 * Handles hybrid pagination: local for initial data, server for additional pages
 */
const normalizeOrdersResponse = (
  response: OrdersQueryResponse,
  currentPage: number,
  frontendLimit: number,
  isInitialData = false,
): PaginatedOrdersResponse => {
  // If it's already a paginated response from server, use it as-is
  if (!Array.isArray(response)) {
    return response;
  }
  
  // Handle array responses (initial data)
  const totalCount = response.length;
  const startIndex = (currentPage - 1) * frontendLimit;
  const endIndex = startIndex + frontendLimit;
  const paginatedData = response.slice(startIndex, endIndex);
  
  // For initial data, we need to be smart about pagination
  if (isInitialData) {
    // If we have exactly the same amount as requested, there might be more on server
    // If we have less, we know this is all the data
    const serverMightHaveMore = totalCount % frontendLimit === 0 && totalCount > 0;
    const localTotalPages = Math.ceil(totalCount / frontendLimit);
    const hasNextPageLocally = currentPage < localTotalPages;
    
    // If we're on the last local page and server might have more, indicate hasNextPage
    const hasNextPage = hasNextPageLocally || (currentPage === localTotalPages && serverMightHaveMore);
    
    return {
      data: paginatedData,
      nextCursor: null,
      count: totalCount, // This is the count of initial data, not total server count
      pagination: {
        limit: frontendLimit,
        hasNextPage,
        totalPages: serverMightHaveMore ? null : localTotalPages, // null means unknown
        currentPage,
        isOffsetBased: true,
      },
    };
  }
  
  // For non-initial data (regular array responses), calculate normally
  const totalPages = Math.ceil(totalCount / frontendLimit);
  const hasNextPage = currentPage < totalPages;
  
  return {
    data: paginatedData,
    nextCursor: null,
    count: totalCount,
    pagination: {
      limit: frontendLimit,
      hasNextPage,
      totalPages,
      currentPage,
      isOffsetBased: true,
    },
  };
};

/**
 * Provider component for Orders context
 * Manages orders state and handles realtime updates with pagination support
 */
export const OrdersProvider = ({
  children,
  agencyMembers,
  agencyId,
  initialOrders,
  customQueryFn,
  customQueryKey,
}: OrdersProviderProps) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Use storage configs for rowsPerPage setting
  const defaultConfig: OrdersConfig = {
    rowsPerPage: 20,
  };

  const validator = (config: unknown): boolean => {
    if (typeof config !== 'object' || config === null) return false;
    const ordersConfig = config as Partial<OrdersConfig>;
    return typeof ordersConfig.rowsPerPage === 'number' && ordersConfig.rowsPerPage > 0;
  };

  const { configs, updateConfig } = useStorageConfigs<OrdersConfig>(
    'orders-pagination-config',
    defaultConfig,
    validator
  );

  const limit = configs.rowsPerPage;

  const { organization, workspace: userWorkspace } = useUserWorkspace();
  const target = userWorkspace.role?.includes('agency') ? 'agency' : 'client';
  
  // Stable query key that includes pagination parameters and search
  const queryKey = useMemo(() => {
    if (customQueryKey) {
      return [...customQueryKey, { page: currentPage, limit, search: searchTerm }];
    }
    const key = ['orders', { page: currentPage, limit, search: searchTerm }];
    return key;
  }, [customQueryKey, currentPage, limit, searchTerm]);

  // Stable query function
  const queryFn = useCallback(async (): Promise<PaginatedOrdersResponse> => {
    // If we have initial orders and no search term, check if we can use them
    if (initialOrders && !searchTerm && Array.isArray(initialOrders)) {
      const localTotalPages = Math.ceil(initialOrders.length / limit);
      
      // If requesting a page within initial data range, use local pagination
      if (currentPage <= localTotalPages) {
        return normalizeOrdersResponse(initialOrders, currentPage, limit, true);
      }
      
      // If requesting beyond initial data, we need to fetch from server
      // Fall through to server fetch logic below
    }

    if (customQueryFn) {
      const response = await customQueryFn({
        page: currentPage,
        limit: limit,
        searchTerm: searchTerm,
      });
      return normalizeOrdersResponse(response, currentPage, limit, false);
    }

    const promise = getOrders(organization.id ?? '', target, true, {
      pagination: {
        page: currentPage,
        limit: limit,
      },
      search: searchTerm ? { term: searchTerm } : undefined,
    });

    return promise;
  }, [customQueryFn, currentPage, limit, searchTerm, organization.id, target, initialOrders]);

  const ordersQuery = useQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    initialData: (() => {
      // Use initial orders only if we're on a page that can be served locally
      if (initialOrders && !searchTerm && Array.isArray(initialOrders)) {
        const localTotalPages = Math.ceil(initialOrders.length / limit);
        if (currentPage <= localTotalPages) {
          return normalizeOrdersResponse(initialOrders, currentPage, limit, true);
        }
      }
      return undefined;
    })(),
    placeholderData: keepPreviousData, // This is the key for smooth pagination!
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
  });

  // Extract pagination data from the response
  const ordersData = ordersQuery.data;
  const orders = ordersData?.data ?? [];
  const nextCursor = ordersData?.nextCursor ?? null;
  const count = ordersData?.count ?? null;
  const serverHasNextPage = ordersData?.pagination?.hasNextPage ?? false;
  const serverCurrentPage = ordersData?.pagination?.currentPage ?? null;
  const isOffsetBased = ordersData?.pagination?.isOffsetBased ?? false;
  const ordersAreLoading = ordersQuery.isLoading || ordersQuery.isPending;
  const isLoadingMore = ordersQuery.isFetching; // Use isFetching for loading indicator

  // Calculate pagination immediately from count and limit
  const totalPages = count ? Math.ceil(count / limit) : null;
  const hasNextPage = count ? currentPage < Math.ceil(count / limit) : serverHasNextPage;

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

  // Function to go to a specific page (offset-based)
  // Uses immediate pagination calculation for fast navigation
  const goToPage = useCallback(
    (page: number) => {
      if (page < 1) return;
      
      // Use immediate calculation - if we have totalPages, check against it
      if (totalPages && page > totalPages) return;
      
      setCurrentPage(page);
    },
    [totalPages],
  );

  // Function to handle search
  // This will switch from local pagination to API calls when searching
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Function to update rows per page
  // When working with initial orders, this will re-paginate locally
  const updateLimit = useCallback((newLimit: number) => {
    updateConfig('rowsPerPage', newLimit);
    setCurrentPage(1); // Reset to first page when changing page size
  }, [updateConfig]);

  // Function to load the next page (cursor-based)
  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || !nextCursor) return;

    try {
      let nextPageData: PaginatedOrdersResponse;

      if (customQueryFn) {
        // For custom query functions, we can't use cursor-based pagination
        // This function might not be applicable for custom queries
        console.warn('loadNextPage with cursor-based pagination is not supported for custom query functions');
        return;
      } else {
        // For default query function, use cursor-based pagination
        nextPageData = await getOrders(
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
      }

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
    customQueryFn,
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
    handleSearch,
    searchTerm,

    // Additional functions
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
