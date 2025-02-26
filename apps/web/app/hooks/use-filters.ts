'use client';
import { useEffect, useMemo, useState } from 'react';

export type FilterFunction<T> = (item: T, selectedValues: string[]) => boolean;

export interface FilterConfig<T> {
  key: string;
  filterFn: FilterFunction<T>;
}

const createFilterRegistry = <T>(initialFilters?: FilterConfig<T>[]) => {
  const filters = new Map<string, FilterFunction<T>>();
  
  initialFilters?.forEach(({ key, filterFn }) => {
    filters.set(key, filterFn);
  });

  return {
    register: (key: string, filterFn: FilterFunction<T>) => filters.set(key, filterFn),
    get: (key: string) => filters.get(key),
    remove: (key: string) => filters.delete(key),
  };
};

export default function useFilters<T>(
  data: T[],
  initialFilters?: FilterConfig<T>[],
  storageKey = 'filters',
) {
  const filterRegistry = useMemo(
    () => createFilterRegistry<T>(initialFilters),
    [initialFilters]
  );

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(() => {
    const savedFilters = localStorage.getItem(storageKey);
    return savedFilters ? JSON.parse(savedFilters) as Record<string, string[]> : {};
  });

  useEffect(() => {
    initialFilters?.forEach(({ key, filterFn }) => {
      filterRegistry.register(key, filterFn);
    });
  }, [initialFilters, filterRegistry]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(activeFilters));
  }, [activeFilters, storageKey]);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.entries(activeFilters).every(([key, selectedValues]) => {
        const filterFn = filterRegistry.get(key);
        if (!filterFn) return true;
        
        if (selectedValues.length === 0) return true;
        
        return filterFn(item, selectedValues);
      }),
    );
  }, [data, activeFilters, filterRegistry]);

  const deriveSelectedValues = (
    key: string,
    filterFn: FilterFunction<T>,
    value?: string,
  ): string[] => {
    // If a specific value is provided, use it
    if (value !== undefined) {
      return [value];
    }

    // Otherwise, find all possible values by checking what the filter function accepts
    const possibleValues = new Set<string>();
    
    data.forEach(item => {
      // For arrays (like tags), we need to extract all possible values
      const itemValue = item[key as keyof T];
      
      if (Array.isArray(itemValue)) {
        itemValue.forEach(v => {
          // Handle nested objects (like tags with tag.id)
          const val = typeof v === 'object' && v !== null ? 
            v.id || v.tag?.id || JSON.stringify(v) : 
            String(v);
          if (filterFn(item, [val])) {
            possibleValues.add(val);
          }
        });
      } else {
        // For simple values (like status)
        const val = String(itemValue);
        if (filterFn(item, [val])) {
          possibleValues.add(val);
        }
      }
    });

    return Array.from(possibleValues);
  };

  const updateFilter = (
    key: string,
    action: 'add' | 'replace' | 'remove' | 'toggle',
    filterFn?: FilterFunction<T>,
    value?: string,
  ) => {
    if (action === 'remove') {
      removeFilter(key);
      return;
    }

    if (!filterFn) return;

    const selectedValues = deriveSelectedValues(key, filterFn, value);

    filterRegistry.register(key, filterFn);

    setActiveFilters((prev) => {
      const currentValues = prev[key] ?? [];
      if (action === 'replace') {
        return { ...prev, [key]: selectedValues };
      } else if (action === 'add') {
        return {
          ...prev,
          [key]: Array.from(new Set([...currentValues, ...selectedValues])),
        };
      } else if (action === 'toggle') {
        const toggledValues = selectedValues.reduce((acc, value) => {
          if (currentValues.includes(value)) {
            return acc.filter((v) => v !== value);
          } else {
            acc.push(value);
          }
          return acc;
        }, [...currentValues]);

        return { ...prev, [key]: toggledValues };
      }
      return prev;
    });
  };

  const removeFilter = (key: string) => {
    filterRegistry.remove(key);
    setActiveFilters((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const getFilterValues = (key: string) => {
    const filter = activeFilters[key];
    return filter ?? null;
  };

  const resetFilters = () => {
    setActiveFilters({});
  };

  return {
    filters: activeFilters,
    filteredData,
    updateFilter,
    removeFilter,
    resetFilters,
    getFilterValues
  };
}