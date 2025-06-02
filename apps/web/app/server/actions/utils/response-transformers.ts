import { PostgrestResponse } from '@supabase/supabase-js';

import { Pagination } from '~/lib/pagination';

const isPostgrestResponse = <T extends Record<string, unknown>>(
  result: PostgrestResponse<T> | T[],
): result is PostgrestResponse<T> => {
  return 'data' in result && 'count' in result;
};

const extractCursorValue = <T extends Record<string, unknown>>(
  data: T[] | null,
  cursorField: string,
): string | null => {
  if (!data?.length) return null;
  
  const lastItem = data[data.length - 1];
  if (lastItem && typeof lastItem === 'object' && cursorField in lastItem) {
    const cursorValue = lastItem[cursorField as keyof typeof lastItem];
    return typeof cursorValue === 'string' ? cursorValue : null;
  }
  return null;
};

export const transformToPaginatedResponse = <T extends Record<string, unknown>>(
  queryResult: PostgrestResponse<T> | T[],
  pagination: Pagination.Request,
): Pagination.Response<T> => {
  // Type guard to check if it's a PostgrestResponse
  const count = isPostgrestResponse(queryResult) ? queryResult.count : null;
  const data = isPostgrestResponse(queryResult)
    ? queryResult.data
    : queryResult;

  const hasNextPage = pagination.limit
    ? data?.length && data.length > pagination.limit
    : false;

  const nextCursor = pagination.cursor && hasNextPage 
    ? extractCursorValue(data, pagination.cursor)
    : null;

  const prevCursor: string | null = null;

  return {
    data,
    total: count ?? null,
    limit: pagination.limit ?? null,
    page: pagination.page ?? null,
    nextCursor,
    prevCursor,
  };
};
