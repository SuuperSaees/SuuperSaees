import { SupabaseClient } from '@supabase/supabase-js';
import type { Client } from '../../../../../../../../../apps/web/lib/client.types';
import { Database } from '../../../../../../../../../apps/web/lib/database.types';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const insertClient = async (
    agencyId: Client.Insert['agency_id'],
    userId: Client.Insert['user_client_id'],
    organizationId: Client.Insert['organization_client_id'],
    supabaseClient?: SupabaseClient<Database>,
    adminActivated = false,
  ): Promise<Client.Insert> => {
    supabaseClient =
      supabaseClient ??
      getSupabaseServerComponentClient({
        admin: adminActivated,
      });
    try {
      const { data: clientData, error: clientError } = await supabaseClient
        .from('clients')
        .insert({
          agency_id: agencyId,
          user_client_id: userId,
          organization_client_id: organizationId,
        })
        .select()
        .single();
      
      //Create user_settings row for the user
      const {error: clientSettingsError} = await supabaseClient
        .from('user_settings')
        .insert({
          user_id: userId,
          organization_id: organizationId,
        })
  
      if (clientError) {
        console.error('Error inserting client', clientError.message);
        throw new Error(`Error inserting client: ${clientError.message}`);
      }else if(clientSettingsError) {
        console.error('Error inserting client settings', clientSettingsError.message);
        throw new Error(`Error inserting client settings: ${clientSettingsError.message}`);
      }
  
      return clientData;
    } catch (error) {
      console.error('Error inserting client', error);
      throw error;
    }
  };