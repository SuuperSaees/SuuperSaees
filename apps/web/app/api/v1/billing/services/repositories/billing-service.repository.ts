import { SupabaseClient } from '@supabase/supabase-js';



import { Database } from '~/lib/database.types';


export interface IBillingServiceRepository {
  create(
    data: Database['public']['Tables']['billing_services']['Insert'],
  ): Promise<Database['public']['Tables']['billing_services']['Row']>;
  findById(
    id: string,
  ): Promise<Database['public']['Tables']['billing_services']['Row']>;
  findByServiceId(
    serviceId: number,
  ): Promise<Database['public']['Tables']['billing_services']['Row']>;
  softDelete(id: string): Promise<void>;
  softDeleteByServiceId(serviceId: string): Promise<void>;
  update(
    id: string,
    data: Partial<Database['public']['Tables']['billing_services']['Update']>,
  ): Promise<Database['public']['Tables']['billing_services']['Row']>;
}

export class BillingServiceRepository implements IBillingServiceRepository {
  constructor(private client: SupabaseClient<Database>) {}

  async create(
    data: Database['public']['Tables']['billing_services']['Insert'],
  ): Promise<Database['public']['Tables']['billing_services']['Row']> {
    const billingServiceToInsert = {
      ...data,
    };

    const { data: createdData, error } = await this.client
      .from('billing_services')
      .insert(billingServiceToInsert)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating billing service: ${error.message}`);
    }

    return createdData;
  }

  async findById(
    id: string,
  ): Promise<Database['public']['Tables']['billing_services']['Row']> {
    const { data, error } = await this.client
      .from('billing_services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(
        `Error fetching billing service with id ${id}: ${error.message}`,
      );
    }

    return data;
  }

  async findByServiceId(
    serviceId: number,
  ): Promise<Database['public']['Tables']['billing_services']['Row']> {
    const { data, error } = await this.client
      .from('billing_services')
      .select('*')
      .eq('service_id', serviceId)
      .single();

    if (error) {
      throw new Error(
        `Error fetching billing service with service_id ${serviceId}: ${error.message}`,
      );
    }

    return data;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.client
      .from('billing_services')
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting billing service: ${error.message}`);
    }
  }

  async softDeleteByServiceId(serviceId: string): Promise<void> {
    const { error } = await this.client
      .from('billing_services')
      .update({ deleted_on: new Date().toISOString() })
      .eq('service_id', serviceId);

    if (error) {
      throw new Error(
        `Error deleting billing service by service_id: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    data: Partial<Database['public']['Tables']['billing_services']['Update']>,
  ): Promise<Database['public']['Tables']['billing_services']['Row']> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedData, error } = await this.client
      .from('billing_services')
      .update(updateData)
      .eq('provider_id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating billing service: ${error.message}`);
    }

    return updatedData;
  }
}