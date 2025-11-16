'use server';

// import { Subscription } from '../../../../../../../../apps/web/lib/subscriptions.types';
import { SupabaseClient } from '@supabase/supabase-js';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';


export const getSubscriptionByOrganizationId = async ():Promise<{
    billing_customer_id: string;
    id: string;
    propietary_organization_id: string;
} | null> => {
    const client = getSupabaseServerComponentClient();
    const primary_owner_user_id = await getPrimaryOwnerId();
            try {
               const {data: fetchedSubscription, error} = await client
               .from('subscriptions')
               .select("billing_customer_id, id, propietary_organization_id")
               .eq("propietary_organization_id", primary_owner_user_id ?? "")
               .eq("status", "active")
               .single()

               if (error) throw new Error(error.message);

               return fetchedSubscription as {
                billing_customer_id: string;
                id: string;
                propietary_organization_id: string;
            }
            } catch (error) {
                console.error("Error fetching products or prices:", error);
                return null;
            }
}

export const getSubscriptionByPropietaryOrganizationId = async (propietaryOrganizationId: string, client?: SupabaseClient<Database>):Promise<{
    billing_customer_id: string;
    id: string;
    propietary_organization_id: string | null;
} | null> => {
    client = client ?? getSupabaseServerComponentClient();
    const {data: fetchedSubscription, error} = await client
    .from('subscriptions')
    .select("billing_customer_id, id, propietary_organization_id")
    .eq("propietary_organization_id", propietaryOrganizationId ?? "")
    .eq("status", "active")
    .single()

    if (error) throw new Error(error.message);

    return fetchedSubscription 
}