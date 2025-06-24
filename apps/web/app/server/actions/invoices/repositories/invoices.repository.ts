import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Invoice } from '~/lib/invoice.types';
import { QueryContext } from '../../query.config';

export class InvoiceRepository {
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
  async list(): Promise<{
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
    const config = this.queryContext.getConfig();
    const effectiveLimit = config?.pagination?.limit ?? 50;
    const currentPage = config?.pagination?.page ?? 1;

    // Build base query
    let query = client
      .from('invoices')
      .select(`
        *,
        client:organizations!client_organization_id(
          id,
          name,
          slug,
          owner_id,
          picture_url,
          accounts(
            email,
            name,
            user_settings(name)
          )
        ),
        agency:organizations!agency_id(
          id,
          name,
          slug,
          picture_url
        ),
        invoice_items(
          id,
          service_id,
          description,
          quantity,
          unit_price,
          total_price
        ),
        invoice_payments(
          id,
          payment_method,
          amount,
          status,
          processed_by,
          processed_at
        )
      `)
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    // Apply filters using internal config
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

    // Apply search using internal config
    if (config?.search?.term) {
      query = query.or(`invoice_number.ilike.%${config.search.term}%,notes.ilike.%${config.search.term}%`);
    }

    // Get total count
    const { count } = await client
      .from('invoices')
      .select('*', { count: 'exact', head: true })
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
      client: invoice.client ? {
        ...invoice.client,
        owner: {
          id: invoice.client.owner_id,
          name: invoice.client.accounts?.user_settings?.[0]?.name ?? invoice.client.accounts?.name ?? null,
          email: invoice.client.accounts?.email ?? null,
        },
        name: Array.isArray(invoice.client) ?
          invoice.client[0]?.name : invoice.client.name,
        picture_url: Array.isArray(invoice.client) ?
          invoice.client[0]?.picture_url : invoice.client.picture_url,
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

  async get(invoiceId: string): Promise<Invoice.Response> {
    const client = this.client;
    
    const { data: invoice, error } = await client
      .from('invoices')
      .select(`
        *,
        client:organizations!client_organization_id(
          id,
          name,
          slug,
          picture_url,
          owner_id,
          accounts(
            email,
            name,
            user_settings(name)
          )
        ),
        agency:organizations!agency_id(
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
      client: Array.isArray(invoice.client) ? {
        ...invoice.client[0],
        owner: {
          id: invoice?.client[0]?.owner_id,
          name: invoice?.client[0]?.accounts?.user_settings?.[0]?.name ?? invoice?.client[0]?.accounts?.name ?? null,
          email: invoice?.client[0]?.accounts?.email ?? null,
        },
        name: invoice.client[0]?.name,
        picture_url: invoice.client[0]?.picture_url,
      } : (
        invoice.client && typeof invoice.client === 'object'
          ? {
              ...invoice.client,
              owner: {
                id: invoice.client.owner_id,
                name: invoice.client.accounts?.user_settings?.[0]?.name ?? invoice.client.accounts?.name,
                email: invoice.client.accounts?.email,
              },
              name: invoice.client.name,
              picture_url: invoice.client.picture_url,
            }
          : null
      ),
      agency: Array.isArray(invoice.agency) ? invoice.agency[0] ?? null : invoice.agency ?? null,
      invoice_items: invoice.invoice_items ?? [],
    } as Invoice.Response;
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