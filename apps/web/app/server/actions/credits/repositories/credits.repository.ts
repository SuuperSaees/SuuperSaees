import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Credit, CreditOperations } from '~/lib/credit.types';
import { QueryContext } from '../../query.config';
import { getSession } from '../../accounts/accounts.action';
import { AccountRoles } from '~/lib/account.types';

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

    // Get session to determine user role and organization
    const session = await getSession();
    const userRole = session.organization?.role ?? '';
    const organizationId = session.organization?.id ?? '';

    if (!userRole || !organizationId) {
      throw new Error('User session or organization not found');
    }

    // First, find the credit_id based on role and filters
    let creditId: string;

    // Check if client_organization_id is provided in filters (for agency)
    const clientOrgIdFromFilter = config?.filters?.client_organization_id?.[0];

    if (AccountRoles.agencyRoles.has(userRole)) {
      // Agency: use client_organization_id from filters or throw error
      if (!clientOrgIdFromFilter) {
        throw new Error('Agency users must provide client_organization_id in filters');
      }

      // Find credit by client_organization_id
      const { data: credit, error: creditError } = await client
        .from('credits')
        .select('id')
        .eq('client_organization_id', clientOrgIdFromFilter)
        .eq('agency_id', organizationId)
        .is('deleted_on', null)
        .single();

      if (creditError ?? !credit) {
        throw new Error(`Credit not found for client organization: ${clientOrgIdFromFilter}`);
      }

      creditId = credit.id;
    } else if (AccountRoles.clientRoles.has(userRole)) {
      // Client: use session organization.id
      const { data: credit, error: creditError } = await client
        .from('credits')
        .select('id')
        .eq('client_organization_id', organizationId)
        .is('deleted_on', null)
        .single();

      if (creditError ?? !credit) {
        throw new Error(`Credit not found for client organization: ${organizationId}`);
      }

      creditId = credit.id;
    } else {
      throw new Error(`Invalid user role: ${userRole}`);
    }

    // Build base query for credit_operations
    let query = client
      .from('credit_operations')
      .select('*')
      .eq('credit_id', creditId)
      .is('deleted_on', null);

    // Apply ordering
    query = query.order('created_at', { ascending: false });

    // Apply filters using internal config
    if (config?.filters) {
      const { status, date_from, date_to } = config.filters;

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      if (date_from) {
        query = query.gte('created_at', date_from);
      }

      if (date_to) {
        query = query.lte('created_at', date_to);
      }
    }

    // Apply search using internal config
    if (config?.search?.term) {
      query = query.or(`description.ilike.%${config.search.term}%`);
    }

    // Get total count with same filtering
    let countQuery = client
      .from('credit_operations')
      .select('*', { count: 'exact', head: true })
      .eq('credit_id', creditId)
      .is('deleted_on', null);

    // Apply same filters to count query
    if (config?.filters) {
      const { status, date_from, date_to } = config.filters;

      if (status && status.length > 0) {
        countQuery = countQuery.in('status', status);
      }

      if (date_from) {
        countQuery = countQuery.gte('created_at', date_from);
      }

      if (date_to) {
        countQuery = countQuery.lte('created_at', date_to);
      }
    }

    // Apply same search to count query
    if (config?.search?.term) {
      countQuery = countQuery.or(`description.ilike.%${config.search.term}%`);
    }

    const { count } = await countQuery;

    // Apply pagination
    const isOffsetBased = 
      config?.pagination?.page !== undefined ||
      config?.pagination?.offset !== undefined;

    if (isOffsetBased) {
      const offset = 
        config?.pagination?.offset ??
        ((config?.pagination?.page ?? 1) - 1) * effectiveLimit;
      query = query.range(offset, offset + effectiveLimit - 1);
    } else if (config?.pagination?.cursor ?? config?.pagination?.endCursor) {
      if (config?.pagination?.cursor) {
        query = query.lt('created_at', config.pagination.cursor);
      }
      if (config?.pagination?.endCursor) {
        query = query.gte('created_at', config.pagination.endCursor);
      }
      query = query.limit(effectiveLimit + 1);
    } else {
      query = query.limit(effectiveLimit + 1);
    }

    const { data: creditOperations, error } = await query;

    if (error) {
      throw new Error(`Error fetching credit operations: ${error.message}`);
    }

    // Process pagination
    let paginatedOperations: CreditOperations.Response[];
    let hasNextPage: boolean;
    let nextCursor: string | null = null;

    if (isOffsetBased) {
      paginatedOperations = creditOperations as unknown as CreditOperations.Response[];
      hasNextPage = (creditOperations?.length ?? 0) === effectiveLimit && 
                   ((config?.pagination?.offset ?? ((currentPage - 1) * effectiveLimit)) + effectiveLimit) < (count ?? 0);
    } else {
      hasNextPage = (creditOperations?.length ?? 0) > effectiveLimit;
      paginatedOperations = hasNextPage ? 
        (creditOperations?.slice(0, effectiveLimit) as unknown as CreditOperations.Response[]) : 
        (creditOperations as unknown as CreditOperations.Response[]);
      
      if (hasNextPage && paginatedOperations.length > 0) {
        nextCursor = paginatedOperations[paginatedOperations.length - 1]?.created_at ?? null;
      }
    }

    return {
      data: paginatedOperations ?? [],
      nextCursor,
      count: count ?? 0,
      pagination: {
        limit: effectiveLimit,
        hasNextPage,
        totalPages: count ? Math.ceil(count / effectiveLimit) : 0,
        currentPage: isOffsetBased ? currentPage : null,
        isOffsetBased,
      },
    };
  }

  async get(clientOrganizationId?: string): Promise<Credit.Response> {
    const client = this.client;
    
    // Get session to determine user role and organization
    const session = await getSession();
    const userRole = session.organization?.role ?? '';
    
    
    if (!userRole) {
      throw new Error('User session not found or invalid');
    }
    const isClientUser = AccountRoles.clientRoles.has(userRole);

    if (!isClientUser && !clientOrganizationId) {
      throw new Error('Agency users must provide clientOrganizationId parameter.');
    }

    const organizationId = (isClientUser ? session.organization?.id ?? clientOrganizationId : clientOrganizationId) ?? '';
    const agencyId = (isClientUser ? session.agency?.id : session.organization?.id) ?? '';
    
      // Client users: find credit where client_organization_id = their organization id
      const { data, error } = await client
        .from('credits')
        .select(`*`)
        .eq('client_organization_id', organizationId)
        .eq('agency_id', agencyId)
        .is('deleted_on', null)
        .single();

      if (error) {
        throw new Error(`Error fetching credit for client: ${error.message}`);
      }

      return data as Credit.Response;
  }

  async getById(creditId: string): Promise<Credit.Response> {
    const client = this.client;
    
    const { data, error } = await client
      .from('credits')
      .select(`*`)
      .eq('id', creditId)
      .is('deleted_on', null)
      .single();

    if (error) {
      throw new Error(`Error fetching credit by ID: ${error.message}`);
    }

    return data as Credit.Response;
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
