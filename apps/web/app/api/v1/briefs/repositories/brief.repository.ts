import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';
import { BriefFormFields } from '~/lib/api/briefs.types';

export class BriefRepository {
  constructor(private client: SupabaseClient<Database>) {}

  async getBriefs(limit: number, offset: number, organizationId?: string, agencyId?: string): Promise<{
    briefs: Database['public']['Tables']['briefs']['Row'][];
    total: number;
  }> {
    // Construir la consulta base

    const { data: clientServicesData, error: clientServicesError } = await this.client
      .from('client_services')
      .select('service_id')
      .eq('client_organization_id', organizationId ?? '')
      .eq('agency_id', agencyId ?? '');

    if (clientServicesError && clientServicesError.code !== 'PGRST116') {
      throw new Error(`Error fetching client services: ${clientServicesError.message}`);
    } else if (clientServicesError) {
      throw new Error('Client services not found');
    }

    const clientServices = clientServicesData?.map((service) => service.service_id) ?? [];

    const { data: serviceBriefsData, error: serviceBriefsError } = await this.client
      .from('service_briefs')
      .select('brief_id')
      .in('service_id', clientServices);

    if (serviceBriefsError && serviceBriefsError.code !== 'PGRST116') {
      throw new Error(`Error fetching service briefs: ${serviceBriefsError.message}`);
    } else if (serviceBriefsError) {
      throw new Error('Service briefs not found');
    }

    const serviceBriefs = serviceBriefsData?.map((service) => service.brief_id) ?? [];

    let query = this.client
      .from('briefs')
      .select('*')
      .is('deleted_on', null)
      .in('id', serviceBriefs);
    
    // Aplicar paginación
    query = query.range(offset, offset + limit - 1);
    
    // Ejecutar la consulta
    const { data: briefs, error } = await query;

    if (error) {
      throw new Error(`Error fetching briefs: ${error.message}`);
    }

    // Obtener el total de briefs
    let countQuery = this.client
      .from('briefs')
      .select('*', { count: 'exact', head: true })
      .is('deleted_on', null);
    
    if (organizationId) {
      countQuery = countQuery.eq('propietary_organization_id', organizationId);
    }
    
    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Error counting briefs: ${countError.message}`);
    }

    return {
      briefs: briefs as Database['public']['Tables']['briefs']['Row'][],
      total: count ?? 0,
    };
  }

  async getBriefById(briefId: string): Promise<BriefFormFields | null> {
    const { data, error } = await this.client
      .from('briefs')
      .select(
        `id, created_at, name, propietary_organization_id, description, isDraft, number, image_url, deleted_on, brief_form_fields 
        ( field:form_fields(id, description, label, type, options, placeholder, position, alert_message, required))`,
      )
      .eq('id', briefId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching brief: ${error.message}`);
    }

    return {
      id: data?.id,
      created_at: data?.created_at,
      name: data?.name,
      propietary_organization_id: data?.propietary_organization_id,
      description: data?.description,
      image_url: data?.image_url,
      form_fields: data?.brief_form_fields?.map((field) => ({
        id: field?.field?.id ?? '',
        type: field?.field?.type ?? 'text',
        description: field?.field?.description ?? '',
        position: field?.field?.position ?? 0,
        required: field?.field?.required ?? false,
        options: field?.field?.options ?? [],
        label: field?.field?.label ?? '',
        placeholder: field?.field?.placeholder ?? '',
        alert_message: field?.field?.alert_message ?? '',
      })),
      deleted_on: data?.deleted_on,
      isDraft: data?.isDraft ?? null,
      number: data?.number ?? null
    };
  }
} 