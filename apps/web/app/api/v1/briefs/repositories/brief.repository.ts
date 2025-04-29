import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

export class BriefRepository {
  constructor(private client: SupabaseClient<Database>) {}

  async getBriefs(limit: number, offset: number, organizationId?: string): Promise<{
    briefs: Database['public']['Tables']['briefs']['Row'][];
    total: number;
  }> {
    // Construir la consulta base
    let query = this.client
      .from('briefs')
      .select('*')
      .is('deleted_on', null);
    
    // Filtrar por organización si se proporciona un ID
    if (organizationId) {
      query = query.eq('propietary_organization_id', organizationId);
    }
    
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
} 