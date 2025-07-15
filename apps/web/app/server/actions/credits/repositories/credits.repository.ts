import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Credit, CreditOperations } from '~/lib/credit.types';
import { QueryContext } from '../../query.config';
import { getSession } from '../../accounts/accounts.action';

export class CreditRepository {
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
  async create(payload: Credit.Request.Create): Promise<Credit.Type> {
    const client = this.adminClient ?? this.client;
    
    const { data, error } = await client
      .from('credits')
      .insert({
        agency_id: payload.agency_id,
        client_organization_id: payload.client_organization_id,
        balance: payload.balance ?? 0,
        user_id: payload.user_id ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating credit: ${error.message}`);
    }

    const credit = data as Credit.Type;

    // Create initial credit operations if provided
    if (payload.credit_operations && payload.credit_operations.length > 0) {
      try {
        await this.createCreditOperations(credit.id, payload.credit_operations);
      } catch (operationError) {
        console.error('Error creating initial credit operations:', operationError);
        // Don't throw here as the credit was created successfully
      }
    }

    return credit;
  }

  private async createCreditOperations(
    creditId: string, 
    operations: CreditOperations.Insert[]
  ): Promise<CreditOperations.Type[]> {
    const client = this.adminClient ?? this.client;
    
    const operationsToInsert = operations.map(op => ({
      ...op,
      credit_id: creditId,
    }));

    const { data, error } = await client
      .from('credit_operations')
      .insert(operationsToInsert)
      .select();

    if (error) {
      throw new Error(`Error creating credit operations: ${error.message}`);
    }

    return data as CreditOperations.Type[];
  }

  // * GET REPOSITORIES
  async list(): Promise<{
    data: Credit.Response[];
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

    // Get session to determine user role and organization
    const session = await getSession();
    const userRole = session.organization?.role ?? '';
    const organizationId = session.organization?.id ?? '';

    if (!userRole || !organizationId) {
      throw new Error('User session not found or invalid');
    }

    // Build base query
    let query = client
      .from('credits')
      .select(`
        *,
        credit_operations:credit_operations(
          id,
          status,
          type,
          quantity,
          description,
          created_at,
          updated_at,
          actor_id,
          metadata
        )
      `, { count: 'exact' })
      .is('deleted_on', null);

    // Apply role-based filtering
    if (userRole.startsWith('agency_')) {
      // Agency users see all credits they manage
      query = query.eq('agency_id', organizationId);
    } else if (userRole.startsWith('client_')) {
      // Client users see only their organization's credits
      query = query.eq('client_organization_id', organizationId);
    } else {
      throw new Error('Invalid user role for credit access');
    }

    // Apply ordering
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const from = (currentPage - 1) * effectiveLimit;
    const to = from + effectiveLimit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error fetching credits: ${error.message}`);
    }

    const hasNextPage = count ? (from + effectiveLimit) < count : false;
    const totalPages = count ? Math.ceil(count / effectiveLimit) : null;

    return {
      data: (data as Credit.Response[]) || [],
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

  async get(creditId: string): Promise<Credit.Response> {
    const client = this.client;
    
    const { data, error } = await client
      .from('credits')
      .select(`
        *,
        credit_operations:credit_operations(
          id,
          status,
          type,
          quantity,
          description,
          created_at,
          updated_at,
          actor_id,
          metadata
        )
      `)
      .eq('id', creditId)
      .is('deleted_on', null)
      .single();

    if (error) {
      throw new Error(`Error fetching credit: ${error.message}`);
    }

    return data as Credit.Response;
  }

  async listByOrganization(organizationId?: string): Promise<{
    data: Credit.Response[];
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

    let targetOrganizationId = organizationId;

    // If no organizationId provided, get from session
    if (!targetOrganizationId) {
      const session = await getSession();
      const userRole = session.organization?.role ?? '';
      targetOrganizationId = session.organization?.id ?? '';

      if (!userRole || !targetOrganizationId) {
        throw new Error('User session not found or invalid');
      }
    }

    // Build base query
    let query = client
      .from('credits')
      .select(`
        *,
        credit_operations:credit_operations(
          id,
          status,
          type,
          quantity,
          description,
          created_at,
          updated_at,
          actor_id,
          metadata
        )
      `, { count: 'exact' })
      .is('deleted_on', null);

    // Filter by organization (either as client or agency)
    query = query.or(`client_organization_id.eq.${targetOrganizationId},agency_id.eq.${targetOrganizationId}`);

    // Apply ordering
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const from = (currentPage - 1) * effectiveLimit;
    const to = from + effectiveLimit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error fetching credits by organization: ${error.message}`);
    }

    const hasNextPage = count ? (from + effectiveLimit) < count : false;
    const totalPages = count ? Math.ceil(count / effectiveLimit) : null;

    return {
      data: (data as Credit.Response[]) || [],
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

  // * UPDATE REPOSITORIES
  async update(payload: Credit.Request.Update): Promise<Credit.Type> {
    const client = this.adminClient ?? this.client;
    
    const { credit_operations: _credit_operations, ...creditData } = payload;
    
    const { data, error } = await client
      .from('credits')
      .update({
        ...creditData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.id!)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating credit: ${error.message}`);
    }

    return data as Credit.Type;
  }

  // * DELETE REPOSITORIES
  async delete(creditId: string): Promise<void> {
    const client = this.adminClient ?? this.client;
    
    const { error } = await client
      .from('credits')
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', creditId);

    if (error) {
      throw new Error(`Error deleting credit: ${error.message}`);
    }
  }
}
