'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const createOrganizationServer = async (clientData: {
    organization_name: string
}) => {
  try {
    const client = getSupabaseServerComponentClient();
    
    const { data: { user } } = await client.auth.getUser();
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const newAccount = {
      name: clientData.organization_name,
      primary_owner_user_id: user.id,
      is_personal_account: false,
    };

    const { error } = await client
      .from('accounts')
      .insert([newAccount]);

    if (error) {
      throw new Error(error.message);
    }

  } catch (error) {
    console.error('Error al crear la cuenta:', error);
  }
};
