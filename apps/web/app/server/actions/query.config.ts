/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call */

import { Database } from '~/lib/database.types';
import { Pagination } from '~/lib/pagination';

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
  pagination?: Pagination.Request;
};

// Compatible with actual Supabase query builder types

type SupabaseQueryBuilder = {
  select: (columns?: string, options?: { count?: string }) => unknown;
  eq: (column: string, value: unknown) => unknown;
  ilike: (column: string, pattern: string) => unknown;
  gt: (column: string, value: unknown) => unknown;
  lt: (column: string, value: unknown) => unknown;
  gte: (column: string, value: unknown) => unknown;
  lte: (column: string, value: unknown) => unknown;
  in: (column: string, values: unknown[]) => unknown;
  is: (column: string, value: unknown) => unknown;
  order: (column: string, options?: { ascending?: boolean }) => unknown;
  limit: (count: number) => unknown;
  range: (from: number, to: number) => unknown;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilderType = any; // Necessary for Supabase query builder type transformations

export class QueryBuilder {
  private static instance: QueryBuilder;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): QueryBuilder {
    if (!QueryBuilder.instance) {
      QueryBuilder.instance = new QueryBuilder();
    }
    return QueryBuilder.instance;
  }

  public enhance<
    TTableName extends keyof Database['public']['Tables'],
    TQuery extends SupabaseQueryBuilder,
  >(
    query: TQuery,
    config?: QueryConfigurations<
      Database['public']['Tables'][TTableName]['Row']
    >,
  ): TQuery {
    if (!config) return query;

    let enhancedQuery: QueryBuilderType = query;

    enhancedQuery = this.applyIncludes(enhancedQuery, config);
    enhancedQuery = this.applyFilters(enhancedQuery, config);
    enhancedQuery = this.applySorts(enhancedQuery, config);
    enhancedQuery = this.applyPagination(enhancedQuery, config);

    return enhancedQuery as TQuery;
  }

  private applyIncludes<T>(
    query: QueryBuilderType,
    config: QueryConfigurations<T>
  ): QueryBuilderType {
    const columns = config.includes?.length ? config.includes.join(', ') : '';
    const needsCount = config.pagination !== undefined;
    console.log('needsCount', needsCount);
    if (needsCount) {
      return query.select(columns, { count: 'exact' });
    } else {
      return query.select(columns);
    }
  }

  private applyFilters<T>(
    query: QueryBuilderType,
    config: QueryConfigurations<T>
  ): QueryBuilderType {
    if (!config.filters?.length) return query;

    let enhancedQuery = query;
    config.filters.forEach(({ field, operator, value }) => {
      switch (operator) {
        case 'eq':
          enhancedQuery = enhancedQuery.eq(field as string, value);
          break;
        case 'like':
          enhancedQuery = enhancedQuery.ilike(
            field as string,
            `%${String(value)}%`,
          );
          break;
        case 'gt':
          enhancedQuery = enhancedQuery.gt(field as string, value);
          break;
        case 'lt':
          enhancedQuery = enhancedQuery.lt(field as string, value);
          break;
        case 'gte':
          enhancedQuery = enhancedQuery.gte(field as string, value);
          break;
        case 'lte':
          enhancedQuery = enhancedQuery.lte(field as string, value);
          break;
        case 'in':
          enhancedQuery = enhancedQuery.in(
            field as string,
            value as unknown[],
          );
          break;
        case 'is':
          enhancedQuery = enhancedQuery.is(field as string, value);
          break;
      }
    });
    return enhancedQuery;
  }

  private applySorts<T>(
    query: QueryBuilderType,
    config: QueryConfigurations<T>
  ): QueryBuilderType {
    if (!config.sorts?.length) return query;

    let enhancedQuery = query;
    config.sorts.forEach(({ field, direction }) => {
      enhancedQuery = enhancedQuery.order(field as string, {
        ascending: direction === 'asc',
      });
    });
    return enhancedQuery;
  }

  private applyPagination<T>(
    query: QueryBuilderType,
    config: QueryConfigurations<T>
  ): QueryBuilderType {
    if (!config.pagination) return query;

    let enhancedQuery = query;

    if (config.pagination.limit) {
      enhancedQuery = enhancedQuery.limit(config.pagination.limit);
    }

    // Cursor-based pagination takes precedence over page-based
    if (config.pagination.cursor) {
      // Assuming cursor represents an ID field for pagination
      enhancedQuery = enhancedQuery.gt(
        'created_at',
        config.pagination.cursor,
      );
    } else if (config.pagination.page && config.pagination.limit) {
      const offset = (config.pagination.page - 1) * config.pagination.limit;
      enhancedQuery = enhancedQuery.range(
        offset,
        offset + config.pagination.limit - 1,
      );
    }

    return enhancedQuery;
  }
}
