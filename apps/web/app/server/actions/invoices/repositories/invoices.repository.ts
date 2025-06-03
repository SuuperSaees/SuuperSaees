import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Invoice } from '~/lib/invoice.types';

interface PaginationConfig {
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

export class InvoiceRepository {
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;

  constructor(
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>,
  ) {
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE REPOSITORIES
  async create(payload: Invoice.Insert): Promise<Invoice.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('invoices') 
      .insert({
        number: payload.number,
        client_organization_id: payload.client_organization_id,
        agency_id: payload.agency_id,
        issue_date: payload.issue_date,
        due_date: payload.due_date,
        status: payload.status ?? 'draft',
        subtotal_amount: payload.subtotal_amount,
        tax_amount: payload.tax_amount ?? 0,
        total_amount: payload.total_amount,
        currency: payload.currency ?? 'USD',
        notes: payload.notes,
        checkout_url: payload.checkout_url, 
        deleted_on: null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating invoice: ${error.message}`);
    }

    return data as Invoice.Type;
  }

  // * GET REPOSITORIES
  async list(
    organizationId: string, 
    config?: PaginationConfig
  ): Promise<{
    data: Invoice.Response[];
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
    const client = this.adminClient ?? this.client;
    const effectiveLimit = config?.pagination?.limit ?? 50;
    const currentPage = config?.pagination?.page ?? 1;

    // Build base query
    let query = client
      .from('invoices')
      .select(`
        *,
        customer:accounts!customer_id(
          id,
          name,
          email,
          picture_url,
          user_settings:user_settings(name, picture_url)
        ),
        organization:organizations!organization_id(
          id,
          name,
          slug,
          picture_url
        ),
        invoice_items(
          id,
          description,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('organization_id', organizationId)
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    // Apply filters
    if (config?.filters) {
      const { status, customer_id, date_from, date_to } = config.filters;

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      if (customer_id && customer_id.length > 0) {
        query = query.in('customer_id', customer_id);
      }

      if (date_from) {
        query = query.gte('issue_date', date_from);
      }

      if (date_to) {
        query = query.lte('issue_date', date_to);
      }
    }

    // Apply search
    if (config?.search?.term) {
      query = query.or(`invoice_number.ilike.%${config.search.term}%,notes.ilike.%${config.search.term}%`);
    }

    // Get total count
    const { count } = await client
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('deleted_on', null);

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

    const { data: invoices, error } = await query;

    if (error) {
      throw new Error(`Error fetching invoices: ${error.message}`);
    }

    // Process pagination
    let paginatedInvoices: Invoice.Response[];
    let hasNextPage: boolean;
    let nextCursor: string | null = null;

    if (isOffsetBased) {
      paginatedInvoices = invoices as unknown as Invoice.Response[];
      hasNextPage = (invoices?.length ?? 0) === effectiveLimit && 
                   ((config?.pagination?.offset ?? ((currentPage - 1) * effectiveLimit)) + effectiveLimit) < (count ?? 0);
    } else {
      hasNextPage = (invoices?.length ?? 0) > effectiveLimit;
      paginatedInvoices = hasNextPage ? 
        (invoices?.slice(0, effectiveLimit) as unknown as Invoice.Response[]) : 
        (invoices as unknown as Invoice.Response[]);
      
      if (hasNextPage && paginatedInvoices.length > 0) {
        nextCursor = paginatedInvoices[paginatedInvoices.length - 1]?.created_at ?? null;
      }
    }

    // Transform data
    const transformedInvoices = paginatedInvoices?.map(invoice => ({
      ...invoice,
      customer: invoice.customer ? {
        ...invoice.customer,
        name: Array.isArray(invoice.customer.settings) ? 
          invoice.customer.settings[0]?.name : invoice.customer.name,
        picture_url: Array.isArray(invoice.customer.settings) ?
          invoice.customer.settings[0]?.picture_url : invoice.customer.picture_url,
      } : null,
      total_amount: invoice.invoice_items?.reduce((sum, item) => sum + (item.total_price ?? 0), 0) ?? invoice.total_amount,
      items_count: invoice.invoice_items?.length ?? 0,
    })) ?? [];

    return {
      data: transformedInvoices as Invoice.Response[],
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

  async get(invoiceId: string): Promise<Invoice.Relational> {
    const client = this.client;
    
    const { data: invoice, error } = await client
      .from('invoices')
      .select(`
        *,
        customer:accounts!customer_id(
          id,
          name,
          email,
          picture_url,
          user_settings:user_settings(name, picture_url)
        ),
        organization:organizations!organization_id(
          id,
          name,
          slug,
          picture_url
        ),
        invoice_items(
          id,
          description,
          quantity,
          unit_price,
          total_price,
          created_at,
          updated_at
        )
      `)
      .eq('id', invoiceId)
      .is('deleted_on', null)
      .single();

    if (error) {
      throw new Error(`Error fetching invoice ${invoiceId}: ${error.message}`);
    }

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    return {
      ...invoice,
      customer: {
        ...invoice.customer,
        // name: Array.isArray(invoice.customer.name) ?
        //   invoice.customer.user_settings[0]?.name ?? invoice.customer.name :
        //   invoice.customer.user_settings?.name ?? invoice.customer.name,
        // picture_url: Array.isArray(invoice.customer.name) ?
        //   invoice.customer.user_settings[0]?.picture_url ?? invoice.customer.picture_url :
        //   invoice.customer.user_settings?.picture_url ?? invoice.customer.picture_url,
      },
      invoice_items: invoice.invoice_items ?? [],
    } as unknown as Invoice.Relational;
  }

  // * DELETE REPOSITORIES
  async delete(invoiceId: string): Promise<void> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('invoices')
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', invoiceId);

    if (error) {
      throw new Error(`Error deleting invoice ${invoiceId}: ${error.message}`);
    }
  }

  // * UPDATE REPOSITORIES
  async update(payload: Invoice.Update): Promise<Invoice.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('invoices')
      .update(payload)
      .eq('id', payload.id ?? '')
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating invoice ${payload.id}: ${error.message}`);
    }

    return data as Invoice.Type;
  }
} 