'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { Pagination } from '~/lib/pagination';

import { deepEqual } from '../utils/compare';
import { debounce } from '../utils/debounce';

// Types
export type QueryFilters = Record<string, unknown>;

interface UseDataPaginationProps<T, F extends QueryFilters = QueryFilters> {
  queryKey: string[];
  queryFn: (params: {
    page: number;
    limit: number;
    filters?: F;
  }) => Promise<Pagination.Response<T>>;
  initialData?: Pagination.Response<T>;
  config?: {
    limit?: number;
    staleTime?: number;
    gcTime?: number;
    filters?: F;
    debounceMs?: number;
    enableVirtualPages?: boolean;
  };
}

interface PaginationState {
  currentPage: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total: number;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  isChangingPage: boolean;
}

function normalizeFilters<F extends QueryFilters>(filters?: F): F | undefined {
  if (!filters) return undefined;
  const normalized = Object.entries(filters).reduce(
    (acc, [k, v]) => {
      if (v !== undefined && v !== '' && v !== null) acc[k] = v;
      return acc;
    },
    {} as Record<string, unknown>,
  );
  return Object.keys(normalized).length > 0 ? (normalized as F) : undefined;
}

function createQueryKey<F extends QueryFilters>(
  baseKey: string[],
  page: number,
  limit: number,
  filters?: F,
) {
  const norm = normalizeFilters(filters);
  return [...baseKey, page, limit, ...(norm ? [norm] : [])];
}

export function useDataPagination<T, F extends QueryFilters = QueryFilters>({
  queryKey,
  queryFn,
  initialData,
  config = {},
}: UseDataPaginationProps<T, F>) {
  const {
    limit: configLimit = 10,
    staleTime = 5 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
    filters,
    debounceMs = 300,
    enableVirtualPages = true,
  } = config;

  const queryClient = useQueryClient();
  const [state, setState] = useState({ page: 1, limit: configLimit });
  const [debouncedFilters, setDebouncedFilters] = useState<F | undefined>(
    normalizeFilters(filters),
  );
  const [isChangingPage, setIsChangingPage] = useState(false);
  const isInitialMount = useRef(true);

  // Debounced filter setter
  const debouncedSetFilters = useMemo(
    () =>
      debounce(
        (f: F | undefined) => setDebouncedFilters(normalizeFilters(f)),
        debounceMs,
      ),
    [debounceMs],
  );

  // Track previous filters and limit
  const prevFilters = useRef<F | undefined>(normalizeFilters(filters));
  const prevLimit = useRef<number>(configLimit);

  // Effect: handle filters/limit changes
  useEffect(() => {
    const normFilters = normalizeFilters(filters);
    if (
      !deepEqual(prevFilters.current, normFilters) ||
      prevLimit.current !== configLimit
    ) {
      prevFilters.current = normFilters;
      prevLimit.current = configLimit;
      setState((s) => ({ ...s, page: 1, limit: configLimit }));
      debouncedSetFilters(filters);
      queryClient
        .invalidateQueries({ queryKey: [...queryKey], exact: false })
        .catch(() => {
          /* ignore */
        });
    }
  }, [filters, configLimit, queryKey, queryClient, debouncedSetFilters]);

  // Virtual pages only if initialData is valid and limit is not greater than initialData.limit
  const virtualPages = useMemo(() => {
    if (
      !enableVirtualPages ||
      !initialData?.data ||
      !isInitialMount.current ||
      typeof initialData.limit !== 'number' ||
      initialData.limit < state.limit ||
      (debouncedFilters && Object.keys(debouncedFilters).length > 0)
    )
      return null;
    const pages: Record<number, Pagination.Response<T>> = {};
    const totalItems = initialData.total ?? initialData.data.length;
    const totalPages = Math.ceil(totalItems / state.limit);
    for (let p = 1; p <= totalPages; p++) {
      const start = (p - 1) * state.limit;
      const end = start + state.limit;
      const pageItems = initialData.data.slice(start, end);
      if (pageItems.length > 0 || p === 1) {
        pages[p] = {
          data: pageItems,
          total: totalItems,
          limit: state.limit,
          page: p,
        };
      }
    }
    return pages;
  }, [enableVirtualPages, initialData, state.limit, debouncedFilters]);

  // Query key
  const currentQueryKey = useMemo(
    () => createQueryKey(queryKey, state.page, state.limit, debouncedFilters),
    [queryKey, state.page, state.limit, debouncedFilters],
  );

  // Query
  const query = useQuery({
    queryKey: currentQueryKey,
    queryFn: async () => {
      // Check if the query has been invalidated by looking at stale status
      const queryState = queryClient.getQueryState(currentQueryKey);
      const isInvalidated = queryState?.isInvalidated ?? queryState?.status === 'error';
      
      // Only use virtual pages if query hasn't been invalidated and is fresh
      if (virtualPages?.[state.page] && !isInvalidated) {
        return virtualPages[state.page];
      }
      
      return queryFn({
        page: state.page,
        limit: state.limit,
        filters: debouncedFilters,
      });
    },
    initialData: virtualPages?.[state.page],
    placeholderData: isInitialMount.current ? undefined : keepPreviousData,
    staleTime,
    gcTime,
    retry: (failCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status >= 400 && status < 500) return false;
      }
      return failCount < 3;
    },
  });

  // Mark initial mount as false after first render
  useEffect(() => {
    if (isInitialMount.current) isInitialMount.current = false;
  }, []);

  // Pagination state from query data
  const data = query.data?.data ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / state.limit));
  const hasNextPage = state.page < totalPages;
  const hasPreviousPage = state.page > 1;

  // Page change logic
  const goToPage = useCallback(
    async (page: number) => {
      const target = Math.max(1, Math.min(page, totalPages));
      if (target === state.page) return;
      setIsChangingPage(true);
      const pageQueryKey = createQueryKey(
        queryKey,
        target,
        state.limit,
        debouncedFilters,
      );
      let dataAvailable = Boolean(
        virtualPages?.[target] ?? queryClient.getQueryData(pageQueryKey),
      );
      if (!dataAvailable) {
        try {
          await queryClient.fetchQuery({
            queryKey: pageQueryKey,
            queryFn: () =>
              queryFn({
                page: target,
                limit: state.limit,
                filters: debouncedFilters,
              }),
            staleTime,
          });
          dataAvailable = true;
        } catch {
          setIsChangingPage(false);
          return;
        }
      }
      if (dataAvailable) setState((s) => ({ ...s, page: target }));
      setIsChangingPage(false);
    },
    [
      state.page,
      state.limit,
      totalPages,
      debouncedFilters,
      queryKey,
      queryClient,
      queryFn,
      staleTime,
      virtualPages,
    ],
  );

  const nextPage = useCallback(
    () => goToPage(state.page + 1),
    [goToPage, state.page],
  );
  const previousPage = useCallback(
    () => goToPage(state.page - 1),
    [goToPage, state.page],
  );

  // Prefetch next page for better UX
  useEffect(() => {
    if (hasNextPage && !query.isFetching) {
      const nextPage = state.page + 1;
      // Only prefetch if not already in virtualPages or cache
      const nextPageQueryKey = createQueryKey(
        queryKey,
        nextPage,
        state.limit,
        debouncedFilters,
      );
      const isNextPageInVirtual = !!virtualPages?.[nextPage];
      const isNextPageInCache = !!queryClient.getQueryData(nextPageQueryKey);
      if (!isNextPageInVirtual && !isNextPageInCache) {
        queryClient
          .prefetchQuery({
            queryKey: nextPageQueryKey,
            queryFn: () =>
              queryFn({
                page: nextPage,
                limit: state.limit,
                filters: debouncedFilters,
              }),
            staleTime,
          })
          .catch(() => {
            /* ignore */
          });
      }
    }
  }, [
    hasNextPage,
    query.isFetching,
    queryKey,
    state.page,
    state.limit,
    debouncedFilters,
    queryClient,
    queryFn,
    staleTime,
    virtualPages,
  ]);

  const pagination: PaginationState = useMemo(
    () => ({
      currentPage: state.page,
      limit: state.limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      total,
      goToPage,
      nextPage,
      previousPage,
      isChangingPage,
    }),
    [
      state.page,
      state.limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      total,
      goToPage,
      nextPage,
      previousPage,
      isChangingPage,
    ],
  );

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching || isChangingPage,
    isError: query.isError,
    error: query.error,
    pagination,
    refetch: query.refetch,
    query,
  };
}
