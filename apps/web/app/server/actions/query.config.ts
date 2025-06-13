export interface PaginationConfig {
  pagination?: {
    cursor?: string | number;
    endCursor?: string | number;
    page?: number;
    offset?: number;
    limit?: number;
  };
  search?: {
    term?: string;
    fields?: string[];
  };
  filters?: {
    status?: string[];
    customer_id?: string[];
    organization_id?: string[];
    date_from?: string;
    date_to?: string;
  };
}

export class QueryContext {
  private static instance: QueryContext;
  private config: PaginationConfig = {};


  static getInstance(): QueryContext {
    if (!QueryContext.instance) {
      QueryContext.instance = new QueryContext();
    }
    return QueryContext.instance;
  }

  setConfig(config: PaginationConfig): this {
    this.config = { ...config };
    return this;
  }

  getConfig(): PaginationConfig {
    return this.config;
  }

  // Builder methods
  paginate(pagination: PaginationConfig['pagination']): this {
    this.config.pagination = pagination;
    return this;
  }

  search(search: PaginationConfig['search']): this {
    this.config.search = search;
    return this;
  }

  filter(filters: PaginationConfig['filters']): this {
    this.config.filters = filters;
    return this;
  }

  reset(): this {
    this.config = {};
    return this;
  }
}

// Factory function para crear contexto
export const createQueryContext = (config?: PaginationConfig) => {
  const context = QueryContext.getInstance().reset();
  if (config) {
    context.setConfig(config);
  }
  return context;
};

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call */

import { Pagination } from '~/lib/pagination';

// WORK IN PROGRESS

export type QueryConfigurations<T> = {
  includes?: string[];
  filters?: Array<{
    field: keyof T | string;
    operator: 'eq' | 'like' | 'ilike' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'is';
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

  public enhance<T extends Record<string, unknown>, TQuery extends SupabaseQueryBuilder>(
    query: TQuery,
    config?: QueryConfigurations<T>,
  ): TQuery {
    if (!config) return query;

    let enhancedQuery: QueryBuilderType = query;

    // if (config.includes) {
    //   enhancedQuery = this.applyIncludes(enhancedQuery, config);
    // }
    if (config.filters) {
      enhancedQuery = this.applyFilters(enhancedQuery, config);
    }
    if (config.sorts) {
      enhancedQuery = this.applySorts(enhancedQuery, config);
    }
    if (config.pagination) {
      enhancedQuery = this.applyPagination(enhancedQuery, config);
    }

    return enhancedQuery as TQuery;
  }

  private applyIncludes<T>(
    query: QueryBuilderType,
    config: QueryConfigurations<T>
  ): QueryBuilderType {
    const columns = config.includes?.length ? config.includes.join(', ') : '';
    const needsCount = config.pagination !== undefined;
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
        case 'ilike':
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