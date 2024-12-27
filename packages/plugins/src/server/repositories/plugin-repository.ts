import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { Plugin, PluginInsert } from '../../types';

export class PluginRepository {
  private readonly tableName = 'plugins';

  constructor(private client: SupabaseClient<Database>) {}

  async create(plugin: PluginInsert) {
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(plugin)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating plugin: ${error.message}`);
    }

    return data as Plugin;
  }

  async getById(id: string): Promise<Plugin | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .is('deleted_on', null)
      .single();

    if (error) {
      throw new Error(`Error fetching plugin by ID: ${error.message}`);
    }

    return data as Plugin;
  }

  async getByAccount(
    accountId: string,
    limit = 10,
    offset = 0,
  ): Promise<Plugin[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('account_id', accountId)
      .is('deleted_on', null)
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching plugins for account: ${error.message}`);
    }

    return data;
  }

  async update(id: string, updates: Partial<PluginInsert>): Promise<Plugin> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .is('deleted_on', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating plugin: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting plugin: ${error.message}`);
    }
  }
}
