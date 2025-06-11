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