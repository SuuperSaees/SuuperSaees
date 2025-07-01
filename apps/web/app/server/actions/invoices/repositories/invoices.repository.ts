import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Invoice } from '~/lib/invoice.types';
import { AccountRoles } from '~/lib/account.types';
import { QueryContext } from '../../query.config';
import { InvoiceSettingsRepository } from './invoice-settings.repository';
import { getSession } from '../../accounts/accounts.action';

export class InvoiceRepository {
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;
  private queryContext: QueryContext;
  private invoiceSettingsRepository: InvoiceSettingsRepository;

  constructor(
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>,
    queryContext?: QueryContext
  ) {
    this.client = client;
    this.adminClient = adminClient;
    this.queryContext = queryContext ?? QueryContext.getInstance();
    this.invoiceSettingsRepository = new InvoiceSettingsRepository(client, adminClient);
  }

  // * CREATE REPOSITORIES
  async create(payload: Invoice.Request.Create): Promise<Invoice.Type> {
    const client = this.adminClient ?? this.client;
    
    // Create the invoice first
    const { data, error } = await client
      .from('invoices') 
      .insert({
        number: '',
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

    const invoice = data as Invoice.Type;

    // Create invoice settings automatically from organizations or use provided settings
    try {
      if (payload.invoice_settings && payload.invoice_settings.length > 0) {
        // Use provided settings
        const settingsWithInvoiceId = payload.invoice_settings.map(setting => ({
          ...setting,
          invoice_id: invoice.id,
        }));
        
        await this.invoiceSettingsRepository.createMany(settingsWithInvoiceId);
      } else {
        // Automatically create settings from organization data
        await this.invoiceSettingsRepository.createInvoiceSettingsFromOrganizations(
          invoice.id,
          payload.agency_id,
          payload.client_organization_id
        );
      }
    } catch (settingsError) {
      // If settings creation fails, log but don't fail the invoice creation
      console.error('Error creating invoice settings:', settingsError);
      console.warn('Invoice created successfully but without settings');
    }

    return invoice;
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

    // Get session to determine user role and organization
    const session = await getSession();
    const userRole = session.organization?.role ?? '';
    const organizationId = session.organization?.id ?? '';

    if (!userRole || !organizationId) {
      throw new Error('User session or organization not found');
    }

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
          picture_url,
          owner_id,
          accounts(
            email,
            name,
            user_settings(name)
          )
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
          invoice_id,
          payment_method,
          amount,
          status,
          provider_charge_id,
          reference_number,
          notes,
          processed_by,
          processed_at,
        ),
        invoice_settings(
          id,
          organization_id,
          name,
          address_1,
          address_2,
          country,
          postal_code,
          city,
          state,
          tax_id_type,
          tax_id_number
        )
      `)
      .is('deleted_on', null);

    // Apply role-based filtering
    if (AccountRoles.agencyRoles.has(userRole)) {
      // User is from agency - filter by agency_id
      query = query.eq('agency_id', organizationId);
    } else if (AccountRoles.clientRoles.has(userRole)) {
      // User is from client - filter by client_organization_id  
      query = query.eq('client_organization_id', organizationId);
    } else {
      throw new Error(`Invalid user role: ${userRole}`);
    }

    // Apply ordering
    query = query.order('created_at', { ascending: false });

    // Apply filters using internal config
    if (config?.filters) {
      const { status, customer_id, date_from, date_to, client_organization_id } = config.filters;

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      if (client_organization_id && client_organization_id.length > 0) {
        query = query.in('client_organization_id', client_organization_id);
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

    // Get total count with same role-based filtering
    let countQuery = client
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .is('deleted_on', null);

    // Apply same role-based filtering to count query
    if (AccountRoles.agencyRoles.has(userRole)) {
      countQuery = countQuery.eq('agency_id', organizationId);
    } else if (AccountRoles.clientRoles.has(userRole)) {
      countQuery = countQuery.eq('client_organization_id', organizationId);
    }

    // Apply same filters to count query
    if (config?.filters) {
      const { status, customer_id, date_from, date_to, client_organization_id } = config.filters;

      if (status && status.length > 0) {
        countQuery = countQuery.in('status', status);
      }

      if (client_organization_id && client_organization_id.length > 0) {
        countQuery = countQuery.in('client_organization_id', client_organization_id);
      }

      if (customer_id && customer_id.length > 0) {
        countQuery = countQuery.in('customer_id', customer_id);
      }

      if (date_from) {
        countQuery = countQuery.gte('issue_date', date_from);
      }

      if (date_to) {
        countQuery = countQuery.lte('issue_date', date_to);
      }
    }

    // Apply same search to count query
    if (config?.search?.term) {
      countQuery = countQuery.or(`invoice_number.ilike.%${config.search.term}%,notes.ilike.%${config.search.term}%`);
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
      agency: invoice.agency ? {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(invoice.agency as any),
        owner: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (invoice.agency as any).owner_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: (invoice.agency as any).accounts?.user_settings?.[0]?.name ?? (invoice.agency as any).accounts?.name ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: (invoice.agency as any).accounts?.email ?? null,
        },
        name: Array.isArray(invoice.agency) ?
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          invoice.agency[0]?.name : (invoice.agency as any).name,
        picture_url: Array.isArray(invoice.agency) ?
          invoice.agency[0]?.picture_url : (invoice.agency as any).picture_url,
      } : null,
      client: invoice.client ? {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(invoice.client as any),
        owner: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (invoice.client as any).owner_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: (invoice.client as any).accounts?.user_settings?.[0]?.name ?? (invoice.client as any).accounts?.name ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: (invoice.client as any).accounts?.email ?? null,
        },
        name: Array.isArray(invoice.client) ?
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          invoice.client[0]?.name : (invoice.client as any).name,
        picture_url: Array.isArray(invoice.client) ?
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          invoice.client[0]?.picture_url : (invoice.client as any).picture_url,
      } : null,
      total_amount: invoice.invoice_items?.reduce((sum, item) => sum + (item.total_price ?? 0), 0) ?? invoice.total_amount,
      items_count: invoice.invoice_items?.length ?? 0,
      invoice_settings: invoice.invoice_settings ?? [],
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
    const client = this.adminClient ?? this.client;

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
          picture_url,
          owner_id,
          accounts(
            email,
            name,
            user_settings(name)
          )
        ),
        invoice_items(
          id,
          description,
          quantity,
          unit_price,
          total_price,
          created_at,
          updated_at,
          service_id
        ),
        invoice_payments(
          id,
          invoice_id,
          payment_method,
          amount,
          status,
          reference_number,
          notes,
          processed_by,
          processed_at
        ),
        invoice_settings(
          id,
          organization_id,
          name,
          address_1,
          address_2,
          country,
          postal_code,
          city,
          state,
          tax_id_type,
          tax_id_number
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
            agency: invoice.agency ? {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(invoice.agency as any),
        owner: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (invoice.agency as any).owner_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: (invoice.agency as any).accounts?.user_settings?.[0]?.name ?? (invoice.agency as any).accounts?.name ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: (invoice.agency as any).accounts?.email ?? null,
        },
        name: Array.isArray(invoice.agency) ?
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          invoice.agency[0]?.name : (invoice.agency as any).name,
        picture_url: Array.isArray(invoice.agency) ?
          invoice.agency[0]?.picture_url : (invoice.agency as any).picture_url,
      } : null,
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(invoice.client as any),
              owner: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                id: (invoice.client as any).owner_id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name: (invoice.client as any).accounts?.user_settings?.[0]?.name ?? (invoice.client as any).accounts?.name,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                email: (invoice.client as any).accounts?.email,
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name: (invoice.client as any).name,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              picture_url: (invoice.client as any).picture_url,
            }
          : null
      ),
      invoice_items: invoice.invoice_items ?? [],
      invoice_payments: invoice.invoice_payments ?? [],
      invoice_settings: invoice.invoice_settings ?? [],
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
  async update(payload: Invoice.Request.Update): Promise<Invoice.Type> {
    const client = this.adminClient ?? this.client;
    
    // Update the invoice
    const { data, error } = await client
      .from('invoices')
      .update({
        client_organization_id: payload.client_organization_id,
        agency_id: payload.agency_id,
        issue_date: payload.issue_date,
        due_date: payload.due_date,
        status: payload.status,
        subtotal_amount: payload.subtotal_amount,
        tax_amount: payload.tax_amount,
        total_amount: payload.total_amount,
        currency: payload.currency,
        notes: payload.notes,
        checkout_url: payload.checkout_url,
        provider_id: payload.provider_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.id ?? '')
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating invoice ${payload.id}: ${error.message}`);
    }

    const invoice = data as Invoice.Type;

    // Update invoice settings if provided
    if (payload.invoice_settings && payload.invoice_settings.length > 0) {
      try {
        for (const setting of payload.invoice_settings) {
          if (setting.id) {
            // Update existing setting
            await this.invoiceSettingsRepository.update({
              ...setting,
              updated_at: new Date().toISOString(),
            });
          } else if (setting.organization_id && payload.id) {
            // Update by invoice_id and organization_id
            await this.invoiceSettingsRepository.updateByInvoiceAndOrganization(
              payload.id,
              setting.organization_id,
              {
                name: setting.name,
                address_1: setting.address_1,
                address_2: setting.address_2,
                country: setting.country,
                postal_code: setting.postal_code,
                city: setting.city,
                state: setting.state,
                tax_id_type: setting.tax_id_type,
                tax_id_number: setting.tax_id_number,
                updated_at: new Date().toISOString(),
              }
            );
          } else {
            // Create new setting if doesn't exist
            await this.invoiceSettingsRepository.create({
              ...setting,
              invoice_id: payload.id!,
            });
          }
        }
      } catch (settingsError) {
        console.error('Error updating invoice settings:', settingsError);
        // You might want to implement a rollback strategy here
      }
    }

    return invoice;
  }
}