'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getOrganizationByUserId } from '../../organizations/get/get-organizations';


export const getAccountOnbardingData = async (accountId: string) => {
    try {
      const client = getSupabaseServerComponentClient();
  
      const { data: userData, error: userDataError } = await client
        .from('accounts')
        .select(`phone_number, name`)
        .eq('id', accountId)
        .single();
        
      if (userDataError) return null;
  
      const organizationData = await getOrganizationByUserId(accountId);
      if (!organizationData) return null;
  
      const { data: organizationSubdomainData, error: organizationSubdomainDataError } = await client
        .from('organization_subdomains')
        .select(`id, subdomain:subdomains(domain)`)
        .eq('organization_id', organizationData.id)
        .single();
  
      if (organizationSubdomainDataError) return null;
  
      return {
        name: userData.name,
        phone_number: userData.phone_number,
        subdomain: organizationSubdomainData?.subdomain?.domain,
      }
    } catch (error) {
      console.error('Error fetching account:', error);
      return null;
    }
  };

