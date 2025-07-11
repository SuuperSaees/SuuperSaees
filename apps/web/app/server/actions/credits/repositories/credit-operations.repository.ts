import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { CreditOperations } from '~/lib/credit.types';
import { QueryContext } from '../../query.config';

export class CreditOperationRepository {
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;
  private queryContext: QueryContext;

  constructor(
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>,
    queryContext?: QueryContext
  ) {
    this.client = client;
    this.adminClient = adminClient;
    this.queryContext = queryContext ?? QueryContext.getInstance();
  }

  // * CREATE REPOSITORIES
  async create(payload: CreditOperations.Insert): Promise<CreditOperations.Type> {
    const client = this.adminClient ?? this.client;
    
    const { data, error } = await client
      .from('credit_operations')
      .insert({
        credit_id: payload.credit_id,
        actor_id: payload.actor_id,
        status: payload.status ?? 'consumed',
        type: payload.type ?? 'user',
        quantity: payload.quantity,
        description: payload.description,
        metadata: payload.metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating credit operation: ${error.message}`);
    }

    return data as CreditOperations.Type;
  }

  async createMany(operations: CreditOperations.Insert[]): Promise<CreditOperations.Type[]> {
    const client = this.adminClient ?? this.client;
    
    const { data, error } = await client
      .from('credit_operations')
      .insert(operations)
      .select();

    if (error) {
      throw new Error(`Error creating credit operations: ${error.message}`);
    }

    return data as CreditOperations.Type[];
  }

  // * GET REPOSITORIES
  async list(): Promise<{
    data: CreditOperations.Response[];
    nextCursor: string | null;
    count: number | null;
    pagination: {
      limit: number;
      hasNextPage: boolean;
      totalPages: number | null;
      currentPage: number | null;
      isOffsetBased: boolean;
    };
  }> {
    const client = this.client;
    const config = this.queryContext.getConfig();
    const effectiveLimit = config?.pagination?.limit ?? 50;
    const currentPage = config?.pagination?.page ?? 1;

    // Build base query
    let query = client
      .from('credit_operations')
      .select(`
        *,
        credit:credits!credit_id(
          id,
          agency_id,
          client_organization_id,
          balance
        )
      `, { count: 'exact' })
      .is('deleted_on', null);

    // Apply ordering
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const from = (currentPage - 1) * effectiveLimit;
    const to = from + effectiveLimit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error fetching credit operations: ${error.message}`);
    }

    const hasNextPage = count ? (from + effectiveLimit) < count : false;
    const totalPages = count ? Math.ceil(count / effectiveLimit) : null;

    return {
      data: (data as CreditOperations.Response[]) || [],
      nextCursor: hasNextPage ? (currentPage + 1).toString() : null,
      count,
      pagination: {
        limit: effectiveLimit,
        hasNextPage,
        totalPages,
        currentPage,
        isOffsetBased: true,
      },
    };
  }

  async get(operationId: string): Promise<CreditOperations.Response> {
    const client = this.client;
    
    const { data, error } = await client
      .from('credit_operations')
      .select(`
        *,
        credit:credits!credit_id(
          id,
          agency_id,
          client_organization_id,
          balance
        )
      `)
      .eq('id', operationId)
      .is('deleted_on', null)
      .single();

    if (error) {
      throw new Error(`Error fetching credit operation: ${error.message}`);
    }

    return data as CreditOperations.Response;
  }

  async getByCreditId(creditId: string): Promise<CreditOperations.Response[]> {
    const client = this.client;
    
    const { data, error } = await client
      .from('credit_operations')
      .select(`
        *,
        credit:credits!credit_id(
          id,
          agency_id,
          client_organization_id,
          balance
        )
      `)
      .eq('credit_id', creditId)
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching credit operations by credit ID: ${error.message}`);
    }

    return (data as CreditOperations.Response[]) || [];
  }

  async getByActorId(actorId: string): Promise<CreditOperations.Response[]> {
    const client = this.client;
    
    const { data, error } = await client
      .from('credit_operations')
      .select(`
        *,
        credit:credits!credit_id(
          id,
          agency_id,
          client_organization_id,
          balance
        )
      `)
      .eq('actor_id', actorId)
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching credit operations by actor ID: ${error.message}`);
    }

    return (data as CreditOperations.Response[]) || [];
  }

  async getByStatus(status: CreditOperations.Enums.Status): Promise<CreditOperations.Response[]> {
    const client = this.client;
    
    const { data, error } = await client
      .from('credit_operations')
      .select(`
        *,
        credit:credits!credit_id(
          id,
          agency_id,
          client_organization_id,
          balance
        )
      `)
      .eq('status', status)
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching credit operations by status: ${error.message}`);
    }

    return (data as CreditOperations.Response[]) || [];
  }

  // * UPDATE REPOSITORIES
  async update(payload: CreditOperations.Update): Promise<CreditOperations.Type> {
    const client = this.adminClient ?? this.client;
    
    const { data, error } = await client
      .from('credit_operations')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.id!)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating credit operation: ${error.message}`);
    }

    return data as CreditOperations.Type;
  }

  // * DELETE REPOSITORIES (soft delete)
  async delete(operationId: string): Promise<void> {
    const client = this.adminClient ?? this.client;
    
    const { error } = await client
      .from('credit_operations')
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', operationId);

    if (error) {
      throw new Error(`Error deleting credit operation: ${error.message}`);
    }
  }

  // * BUSINESS LOGIC REPOSITORIES
  async getOperationsByDateRange(
    creditId: string,
    startDate: string,
    endDate: string
  ): Promise<CreditOperations.Response[]> {
    const client = this.client;
    
    const { data, error } = await client
      .from('credit_operations')
      .select(`
        *,
        credit:credits!credit_id(
          id,
          agency_id,
          client_organization_id,
          balance
        )
      `)
      .eq('credit_id', creditId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching credit operations by date range: ${error.message}`);
    }

    return (data as CreditOperations.Response[]) || [];
  }

  async getTotalQuantityByStatus(
    creditId: string,
    status: CreditOperations.Enums.Status
  ): Promise<number> {
    const client = this.client;
    
    const { data, error } = await client
      .from('credit_operations')
      .select('quantity')
      .eq('credit_id', creditId)
      .eq('status', status)
      .is('deleted_on', null);

    if (error) {
      throw new Error(`Error calculating total quantity by status: ${error.message}`);
    }

    return data?.reduce((total, operation) => total + (operation.quantity || 0), 0) || 0;
  }
}
