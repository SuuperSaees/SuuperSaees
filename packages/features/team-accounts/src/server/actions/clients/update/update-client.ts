'use server'
import { getSupabaseServerComponentClient } from "@kit/supabase/server-component-client";
import { Client } from "../../../../../../../../apps/web/lib/client.types"
import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";

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
    console.log('before update client (userData):', updateData);
    console.log('before update client (clientId):', clientId);
    const { data: clientData, error: errorUpdateClient } =
      await databaseClient
        .from('clients')
        .update(updateData)
        .eq('user_client_id', clientId);

    console.log('after update client (clientData):', updateData);
    console.log('after update client (errorUpdateClient):', errorUpdateClient);
    if (errorUpdateClient)
      throw new Error(
        `Error updating the client: ${errorUpdateClient.message}`,
      );
    
    console.log('this means there was no errorUpdateClient, so clientData is:', clientData);
    revalidatePath('/clients');
    revalidatePath(`/clients/organizations/*`);

    return clientId;
  } catch (error) {
    console.error('Error updating the client', error);
    throw error;
  }
}