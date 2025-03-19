import { SupabaseClient } from '@supabase/supabase-js';
import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import { config } from 'process';
import { TableName } from '~/lib/chats.types';
import { Database } from '~/lib/database.types';

// WORK IN PROGRESS

export type QueryConfigurations<T> = {
  includes?: string[];
  filters?: Array<{
    field: keyof T | string;
    operator: 'eq' | 'like' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'is';
    value: unknown;
  }>;
  sorts?: Array<{
    field: keyof T | string;
    direction: 'asc' | 'desc';
  }>;
  limit?: number;
  offset?: number;
};

export class QueryBuilder<T extends GenericSchema> {
  private static instance: QueryBuilder<any>;

  private constructor() {}

  public static getInstance<T extends GenericSchema>(): QueryBuilder<T> {
    if (!QueryBuilder.instance) {
      QueryBuilder.instance = new QueryBuilder<T>();
    }
    return QueryBuilder.instance;
  }

  public enhance<TableName extends keyof Database['public']['Tables']>(
    query: SupabaseClient<Database>['from']<TableName>,
    config?: QueryConfigurations<Database['public']['Tables'][TableName]['Row']>
  ): SupabaseClient<Database>['from']<TableName> {
    if (!config) return query;

    let enhancedQuery = query;

    // Apply includes
    if (config.includes?.length) {
      enhancedQuery = enhancedQuery.select(config.includes.join(', '));
    }

    // Apply filters
    if (config.filters?.length) {
      config.filters.forEach(({ field, operator, value }) => {
        switch (operator) {
          case 'eq':
            enhancedQuery = enhancedQuery.eq(field as string, value as any);
            break;
          case 'like':
            enhancedQuery = enhancedQuery.ilike(field as string, `%${String(value)}%`);
            break;
          case 'gt':
            enhancedQuery = enhancedQuery.gt(field as string, value as any);
            break;
          case 'lt':
            enhancedQuery = enhancedQuery.lt(field as string, value as any);
            break;
          case 'gte':
            enhancedQuery = enhancedQuery.gte(field as string, value as any);
            break;
          case 'lte':
            enhancedQuery = enhancedQuery.lte(field as string, value as any);
            break;
          case 'in':
            enhancedQuery = enhancedQuery.in(field as string, value as any[]);
            break;
          case 'is':
            enhancedQuery = enhancedQuery.is(field as string, value as any);
            break;
        }
      });
    }

    // Apply sorting
    if (config.sorts?.length) {
      config.sorts.forEach(({ field, direction }) => {
        enhancedQuery = enhancedQuery.order(field as string, { ascending: direction === 'asc' });
      });
    }

    // Apply pagination
    if (config.limit) {
      enhancedQuery = enhancedQuery.limit(config.limit);
    }

    if (config.offset) {
      enhancedQuery = enhancedQuery.range(
        config.offset, 
        (config.offset + (config.limit || 10)) - 1
      );
    }

    return enhancedQuery;
  }
}