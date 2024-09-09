'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const getOrganization = async ():Promise<{
    organization_id: string | null;
  }> => {
    const client = getSupabaseServerComponentClient()

    const {
        data: { user },
      } = await client.auth.getUser();
  
      if (!user) {
        throw new Error('Error to get user account');
      }

    const {data: organizationAccount, error: organizationAccountError} = await client
    .from('accounts')
    .select('organization_id') // here you can add other properties 
    .eq('id', user?.id)
    .single()

    if(organizationAccountError) {
        throw new Error(organizationAccountError.message)
    }

    return organizationAccount // Don't change this line
  }