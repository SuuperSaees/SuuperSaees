'use client';

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
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

import { ViewTypeEnum } from '~/(views)/views.types';
import { createSubscriptionHandler } from '~/hooks/create-subscription-handler';
import { useOrdersSubscriptionsHandlers } from '~/hooks/use-orders-subscriptions-handlers';
import { useRealtime } from '~/hooks/use-realtime';
import useStorageConfigs from '~/hooks/use-storage-configs';
import { type Order } from '~/lib/order.types';
import { getOrders } from '~/team-accounts/src/server/actions/orders/get/get-order';

import { OrdersViewConfig } from '../../hooks/use-orders-view-configs';
import {
  type OrdersContextType,
  type OrdersProviderProps,
  type OrdersQueryResponse,
  type PaginatedOrdersResponse,
} from './orders-context.types';

// Configuration type for orders view

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
    const serverMightHaveMore =
      totalCount % frontendLimit === 0 && totalCount > 0;
    const localTotalPages = Math.ceil(totalCount / frontendLimit);
    const hasNextPageLocally = currentPage < localTotalPages;

    // If we're on the last local page and server might have more, indicate hasNextPage
    const hasNextPage =
      hasNextPageLocally ||
      (currentPage === localTotalPages && serverMightHaveMore);

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
  currentView,
}: OrdersProviderProps) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem('orders-filters-v2');
      return stored ? (JSON.parse(stored) as Record<string, string[]>) : {};
    } catch (error) {
      console.error('Error reading filters from localStorage:', error);
      return {};
    }
  });

  // Use storage configs for rowsPerPage setting

  const validator = (config: unknown): boolean => {
    if (typeof config !== 'object' || config === null) return false;
    const ordersConfig = config as Partial<OrdersViewConfig>;
    return (
      typeof ordersConfig.table?.rowsPerPage === 'number' &&
      ordersConfig.table?.rowsPerPage > 0
    );
  };

  // Default configuration
  const defaultConfig: OrdersViewConfig = {
    currentView: ViewTypeEnum.Table,
    table: {
      rowsPerPage: 10,
    },
  };

  const { configs, updateConfig } = useStorageConfigs<OrdersViewConfig>(
    'orders-config',
    defaultConfig,
    validator,
  );

  const limit = configs.table?.rowsPerPage ?? 10;

  const { organization, workspace: userWorkspace } = useUserWorkspace();
  const target = userWorkspace.role?.includes('agency') ? 'agency' : 'client';

  // Get current view from storage if not provided as prop
  const [activeView, setActiveView] = useState(() => {
    if (currentView) return currentView;

    try {
      const stored = localStorage.getItem('orders-config');
      if (stored) {
        const parsed = JSON.parse(stored) as { currentView?: string };
        return parsed.currentView ?? 'table';
      }
    } catch (error) {
      console.error('Error reading view config from localStorage:', error);
    }
    return 'table';
  });

  // Listen for storage changes to sync view across components
  useEffect(() => {
    if (currentView) {
      setActiveView(currentView);
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'orders-config' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as { currentView?: string };
          setActiveView(parsed.currentView ?? 'table');
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };

    // Also listen for custom events for same-tab updates
    const handleCustomStorageChange = () => {
      try {
        const stored = localStorage.getItem('orders-config');
        if (stored) {
          const parsed = JSON.parse(stored) as { currentView?: string };
          setActiveView(parsed.currentView ?? 'table');
        }
      } catch (error) {
        console.error('Error reading view config from localStorage:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('orders-config-changed', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'orders-config-changed',
        handleCustomStorageChange,
      );
    };
  }, [currentView]);

  // Determine if pagination should be used based on view
  const shouldUsePagination = activeView === 'table';
  const effectiveLimit = shouldUsePagination ? limit : undefined;

  // Stable query key that includes pagination parameters and search
  const queryKey = useMemo(() => {
    if (customQueryKey) {
      return [
        ...customQueryKey,
        {
          page: currentPage,
          limit: effectiveLimit,
          search: searchTerm,
          view: activeView,
          filters: filters,
        },
      ];
    }
    const key = [
      'orders',
      {
        page: currentPage,
        limit: effectiveLimit,
        search: searchTerm,
        view: activeView,
        filters: filters,
      },
    ];
    return key;
  }, [customQueryKey, currentPage, effectiveLimit, searchTerm, activeView, filters]);

  // Stable query function
  const queryFn = useCallback(async (): Promise<PaginatedOrdersResponse> => {
    // If we have initial orders and no search term or filters, check if we can use them
    if (initialOrders && !searchTerm && Object.keys(filters).length === 0) {
      // Handle both array format (legacy) and PaginatedOrdersResponse format
      const ordersArray = Array.isArray(initialOrders) 
        ? initialOrders 
        : initialOrders.data;
      
      if (ordersArray && Array.isArray(ordersArray)) {
        // For non-table views (kanban, calendar), we need ALL data, not limited initial data
        // Only use initial data if we're confident it contains all orders
        if (!shouldUsePagination) {
          // Check if initial data has all orders (no next page)
          const hasAllData = Array.isArray(initialOrders) 
            ? true // Legacy array format assumed to have all data
            : !initialOrders.pagination?.hasNextPage; // Check if server says no more pages
          
          if (!hasAllData) {
            // Initial data is limited but we need all data for kanban/calendar
            // Fall through to make API call without pagination
          } else {
            // We have all the data, use it
            return Array.isArray(initialOrders) 
              ? normalizeOrdersResponse(ordersArray, 1, ordersArray.length, true)
              : initialOrders;
          }
        } else {
          // Table view with pagination - use initial data for local pagination
          const localLimit = limit;
          const localTotalPages = Math.ceil(ordersArray.length / localLimit);

          // If requesting a page within initial data range, use local pagination
          if (currentPage <= localTotalPages) {
            // If initialOrders is already a PaginatedOrdersResponse and we're on page 1, use it directly
            if (!Array.isArray(initialOrders) && currentPage === 1 && localLimit >= ordersArray.length) {
              return initialOrders;
            }
            
            // For local pagination, preserve the original server count if available
            if (!Array.isArray(initialOrders)) {
              // Use the original server metadata but with paginated local data
              const startIndex = (currentPage - 1) * localLimit;
              const endIndex = startIndex + localLimit;
              const paginatedData = ordersArray.slice(startIndex, endIndex);
              
              return {
                data: paginatedData,
                nextCursor: initialOrders.nextCursor,
                count: initialOrders.count, // Preserve original server count
                pagination: {
                  ...initialOrders.pagination,
                  currentPage,
                  hasNextPage: currentPage < localTotalPages || (initialOrders.pagination?.hasNextPage ?? false),
                  totalPages: initialOrders.pagination?.totalPages ?? null,
                },
              };
            }
            
            // Otherwise, normalize the array data (legacy array format)
            return normalizeOrdersResponse(
              ordersArray,
              currentPage,
              localLimit,
              true,
            );
          }

          // If requesting beyond initial data, we need to fetch from server
          // Fall through to server fetch logic below
        }
      }
    }
    
    if (customQueryFn) {
      const response = await customQueryFn({
        page: currentPage,
        limit: effectiveLimit ?? limit,
        searchTerm: searchTerm,
        view: activeView,
      });
      return normalizeOrdersResponse(
        response,
        currentPage,
        effectiveLimit ?? limit,
        false,
      );
    }

    const paginationConfig = shouldUsePagination
      ? {
          page: currentPage,
          limit: limit,
        }
      : undefined;

    const promise = getOrders(organization.id ?? '', target, true, {
      pagination: paginationConfig,
      search: searchTerm ? { term: searchTerm } : undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    return promise;
  }, [
    customQueryFn,
    currentPage,
    effectiveLimit,
    limit,
    searchTerm,
    organization.id,
    target,
    initialOrders,
    shouldUsePagination,
    activeView,
    filters,
  ]);

  // Memoize the initial data calculation to prevent unnecessary re-computation
  const initialData = useMemo(() => {
    // Use initial orders only if we're on page 1, have no search, and no filters
    if (
      initialOrders && 
      currentPage === 1 && 
      !searchTerm && 
      Object.keys(filters).length === 0
    ) {
      // Handle both array format (legacy) and PaginatedOrdersResponse format
      const ordersArray = Array.isArray(initialOrders) 
        ? initialOrders 
        : initialOrders.data;
      
      if (ordersArray && Array.isArray(ordersArray)) {
        // For non-table views, only use initial data if it contains all orders
        if (!shouldUsePagination) {
          const hasAllData = Array.isArray(initialOrders) 
            ? true // Legacy array format assumed to have all data
            : !initialOrders.pagination?.hasNextPage; // Check if server says no more pages
          
          if (!hasAllData) {
            // Don't use limited initial data for kanban/calendar views
            return undefined;
          }
          
          // We have all the data, use it
          return Array.isArray(initialOrders) 
            ? normalizeOrdersResponse(ordersArray, 1, ordersArray.length, true)
            : initialOrders;
        }
        
        // Table view - use initial data for pagination
        if (!Array.isArray(initialOrders)) {
          return initialOrders;
        }
        
        // Otherwise, normalize the array data
        const localLimit = shouldUsePagination ? limit : ordersArray.length;
        return normalizeOrdersResponse(
          ordersArray,
          currentPage,
          localLimit,
          true,
        );
      }
    }
    
    return undefined;
  }, [initialOrders, currentPage, searchTerm, filters, shouldUsePagination, limit]);

  const ordersQuery = useQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    initialData: initialData,
    placeholderData: keepPreviousData, // This is the key for smooth pagination!
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    // Only refetch when we don't have initial data or when explicitly needed
    refetchOnMount: !initialData,
    refetchOnWindowFocus: false, // Disable automatic refetch on focus
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
  const totalPages =
    shouldUsePagination && count ? Math.ceil(count / limit) : null;
  const hasNextPage =
    shouldUsePagination && count
      ? currentPage < Math.ceil(count / limit)
      : serverHasNextPage;

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
  const updateLimit = useCallback(
    (newLimit: number) => {
      updateConfig('table', {
        ...configs.table,
        rowsPerPage: newLimit,
      });
      setCurrentPage(1); // Reset to first page when changing page size
    },
    [updateConfig, configs.table],
  );

  // Function to load the next page (cursor-based)
  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || !nextCursor) return;

    try {
      let nextPageData: PaginatedOrdersResponse;

      if (customQueryFn) {
        // For custom query functions, we can't use cursor-based pagination
        // This function might not be applicable for custom queries
        console.warn(
          'loadNextPage with cursor-based pagination is not supported for custom query functions',
        );
        return;
      } else {
        // For default query function, use cursor-based pagination
        nextPageData = await getOrders(organization.id ?? '', target, true, {
          pagination: {
            cursor: nextCursor,
            limit: limit,
          },
          search: searchTerm ? { term: searchTerm } : undefined,
        });
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

  // Function to update filters
  const updateFilters = useCallback((newFilters: Record<string, string[]>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    
    // Persist filters to localStorage
    try {
      localStorage.setItem('orders-filters-v2', JSON.stringify(newFilters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, []);

  // Function to reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
    
    // Clear filters from localStorage
    try {
      localStorage.removeItem('orders-filters-v2');
    } catch (error) {
      console.error('Error removing filters from localStorage:', error);
    }
  }, []);

  // Function to get filter values
  const getFilterValues = useCallback((key: string) => {
    return filters[key] ?? [];
  }, [filters]);

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
    limit: effectiveLimit ?? limit,

    // Pagination functions
    goToPage,
    loadNextPage,
    handleSearch,
    searchTerm,

    // Additional functions
    updateLimit,
    isLoadingMore,

    // Filter functions
    updateFilters,
    resetFilters,
    getFilterValues,
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