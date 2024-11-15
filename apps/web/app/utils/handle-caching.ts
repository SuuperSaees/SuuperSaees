import { useQueryClient } from "@tanstack/react-query";


export const getCache = <T>(key: string): T | null => {
  const cached = localStorage.getItem(key);
  if (cached) {
    const { data, expiry } = JSON.parse(cached) as { data: T; expiry: number };
    if (expiry > Date.now()) {
      return data;
    }
  }
  return null;
};

export const setCache = <T>(key: string, data: T, cacheExpiry: number): void => {
  const expiry = Date.now() + cacheExpiry;
  localStorage.setItem(key, JSON.stringify({ data, expiry }));
};

export function updateCache<T>(
  // key: string,
  newData: T,
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: unknown[],
  // cacheExpiry: number
): void {
  // setCache(key, newData, cacheExpiry);
  queryClient.setQueryData(queryKey, newData);
}