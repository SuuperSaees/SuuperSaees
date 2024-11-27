'use server'
import { getSupabaseServerComponentClient } from "@kit/supabase/server-component-client";
import { Client } from "../../../../../../../../apps/web/lib/client.types"
import { SupabaseClient } from '@supabase/supabase-js';

export const updateClient = async (
  updateData: Client.Update,
  clientId: Client.Type['id'],
  databaseClient?: SupabaseClient,
  adminActivated = false,
) => {
  databaseClient =
    databaseClient ??
    getSupabaseServerComponentClient({
      admin: adminActivated,
    });
  try {
    const { data: clientData, error: errorUpdateClient } =
      await databaseClient
        .from('clients')
        .update(updateData)
        .eq('user_client_id', clientId);
    if (errorUpdateClient)
      throw new Error(
        `Error updating the client: ${errorUpdateClient.message}`,
      );
    return clientData;
  } catch (error) {
    console.error('Error updating the client', error);
    throw error;
  }
}