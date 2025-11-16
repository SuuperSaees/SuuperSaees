import { SupabaseClient } from '@supabase/supabase-js';



import { Database } from '~/lib/database.types';



import { ServiceBuilder } from '../builders/service.builder';
import { CreateServiceDTO, UpdateServiceDTO } from '../dtos/service.dto';


export interface IServiceRepository {
  create(
    data: CreateServiceDTO,
  ): Promise<Database['public']['Tables']['services']['Row']>;
  findById(
    id: string,
  ): Promise<Database['public']['Tables']['services']['Row']>;
  listByOrganizationId(
    organizationId: string,
  ): Promise<Database['public']['Tables']['services']['Row'][]>;
  softDelete(id: string): Promise<void>;
  update(
    id: number,
    data: UpdateServiceDTO,
  ): Promise<Database['public']['Tables']['services']['Row']>;
}

export class ServiceRepository implements IServiceRepository {
  constructor(private client: SupabaseClient<Database>) {}

  async create(
    data: CreateServiceDTO,
  ): Promise<Database['public']['Tables']['services']['Row']> {
    const serviceToInsert = ServiceBuilder.fromDTO(data);
    const { data: createdData, error } = await this.client
      .from('services')
      .insert(serviceToInsert)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }

    return createdData as Database['public']['Tables']['services']['Row'];
  }

  async findById(
    id: string,
  ): Promise<Database['public']['Tables']['services']['Row']> {
    const { data, error } = await this.client
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching service with id ${id}: ${error.message}`);
    }

    return data as Database['public']['Tables']['services']['Row'];
  }

  async listByOrganizationId(
    organizationId: string,
  ): Promise<Database['public']['Tables']['services']['Row'][]> {
    const { data, error } = await this.client
      .from('services')
      .select('*')
      .eq('propietary_organization_id', organizationId);

    if (error) {
      throw new Error(
        `Error fetching services for organization ${organizationId}: ${error.message}`,
      );
    }

    return data as Database['public']['Tables']['services']['Row'][];
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.client
      .from('services')
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }

  async update(
    id: number,
    data: UpdateServiceDTO,
  ): Promise<Database['public']['Tables']['services']['Row']> {
    const serviceToUpdate = ServiceBuilder.fromDTO(data);
    const { data: updatedData, error } = await this.client
      .from('services')
      .update(serviceToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }

    return updatedData as Database['public']['Tables']['services']['Row'];
  }
}