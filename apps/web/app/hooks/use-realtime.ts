'use client';

import { useEffect } from 'react';

import {
  REALTIME_LISTEN_TYPES,
  RealtimeChannel,
  RealtimePostgresChangesFilter,
  RealtimePostgresChangesPayload,

} from '@supabase/supabase-js';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

// Define valid types for filter values
export type ValidFilterValue = string | number | boolean;

// Define the structure for table configuration with stricter types
export type TableConfig<T> = {
  tableName: string;
  currentData: T | T[];
  setData: React.Dispatch<React.SetStateAction<T | T[]>>;
  filter?: Record<string, ValidFilterValue>;
};

export type RealtimeConfig = {
  channelName: string;
  schema?: string;
};

export type HandleDataChange<T> = (
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  currentData: T | T[],
  setData: React.Dispatch<React.SetStateAction<T | T[]>>,
) => void | Promise<void>;

/**
 * This function subscribes to realtime changes for a list of tables and handles the changes by calling the provided handleDataChange function.
 * @param tables - An array of table configurations with the current data and a function to update the data.
 * @param config - The configuration for the realtime subscription.
 * @param handleDataChange - The function to handle the realtime changes.
 */
export function useRealtime<T extends Record<string, unknown>>(
  tables: TableConfig<T>[],
  config: RealtimeConfig,
  handleDataChange: HandleDataChange<T>,
) {
  const supabase = useSupabase();
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = () => {

      channel = supabase.channel(config.channelName);

      tables.forEach((table) => {
        const filterConfig: RealtimePostgresChangesFilter<'*'> = {
          event: '*',
          schema: config.schema ?? 'public',
          table: table.tableName,
          ...(table.filter && { filter: createFilterString(table.filter) }),
        };

        channel = channel.on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          filterConfig,
          (
            payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
          ) => {
            void handleDataChange(payload, table.currentData, table.setData);
          },
        );
      });

      channel.subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [supabase, tables, config, handleDataChange]);
}

// Type guard to check if a value is a valid filter value
function isValidFilterValue(value: unknown): value is ValidFilterValue {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

// Helper function to convert filter object to PostgreSQL filter string
function createFilterString(filter: Record<string, unknown>): string {
  try {
    // Convert each key-value pair to a filter string with proper type checking
    return Object.entries(filter)
      .filter(([_, value]) => value) // Skip undefined values
      .map(([key, value]) => {
        const formattedValue = formatFilterValue(value);
        return `${key}=${formattedValue}`;
      })
      .join(',');
  } catch (error) {
    // If there's an error, provide a helpful message
    console.error('Error creating filter string:', error);
    throw new Error(
      'Failed to create filter string. All filter values must be strings, numbers, or booleans.',
    );
  }
}

// Helper function to safely convert a value to a string for the filter
function formatFilterValue(value: unknown): string {
  if (!isValidFilterValue(value)) {
    throw new Error(`Invalid filter value: ${String(value)}`);
  }

  // If it's already a formatted filter string (e.g., "eq.123"), return as is
  if (typeof value === 'string' && value.includes('eq.')) {
    return value;
  }

  // For other values, format them safely
  return `eq.${String(value)}`;
}
