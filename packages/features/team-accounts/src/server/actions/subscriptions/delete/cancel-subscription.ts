'use server';
import { Subscription } from '../../../../../../../../apps/web/lib/subscriptions.types';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';

export const cancelSubscription = async (subscriptionId: any):Promise<Subscription.Type | null> => {
    const client = getSupabaseServerComponentClient();
    const primary_owner_user_id = await getPrimaryOwnerId();
    const newSubscription: {
        status: "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused";
        active: boolean;
    } = {
        active: true,
        status: "canceled",
    };
            try {
               const {data: updatedSubscription, error} = await client
               .from('subscriptions')
               .update(newSubscription)
               .eq("propietary_organization_id", primary_owner_user_id ?? "")
               .single()

               if (error) throw new Error(error.message);

               return updatedSubscription
            } catch (error) {
                console.error("Error fetching products or prices:", error);
                return null;
            }
}