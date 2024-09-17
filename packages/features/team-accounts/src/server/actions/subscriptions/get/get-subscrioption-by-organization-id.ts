'use server';
import { Subscription } from '../../../../../../../../apps/web/lib/subscriptions.types';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';

export const getSubscriptionByOrganizationId = async ():Promise<Subscription.Type | null> => {
    const client = getSupabaseServerComponentClient();
    const primary_owner_user_id = await getPrimaryOwnerId();
            try {
               const {data: fetchedSubscription, error} = await client
               .from('subscriptions')
               .select("*")
               .eq("propietary_organization_id", primary_owner_user_id ?? "")
               .single()

               if (error) throw new Error(error.message);

               return fetchedSubscription
            } catch (error) {
                console.error("Error fetching products or prices:", error);
                return null;
            }
}