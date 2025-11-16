'use server';
import { Subscription } from '../../../../../../../../apps/web/lib/subscriptions.types';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';

export const updateSubscription = async (subscriptionData: {
    id?: string;
    billing_customer_id?: string;
    status?: "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused";
}):Promise<Subscription.Type | null> => {
    const client = getSupabaseServerComponentClient();
    const primary_owner_user_id = await getPrimaryOwnerId();
    const newSubscription: {
        id: string;
        billing_customer_id: string;
        status: "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused";
        updated_at: string | null;
    } = {
        id: subscriptionData?.id as string,
        billing_customer_id: subscriptionData?.billing_customer_id as string,
        status: subscriptionData.status!,
        updated_at: new Date().toISOString(), 
    };
            try {
               const {data: updatedSubscription, error} = await client
               .from('subscriptions')
               .update(newSubscription)
               .eq("propietary_organization_id", primary_owner_user_id ?? "")
               .eq("status", "active")
               .single()
               if (error) throw new Error(error.message);

               return updatedSubscription
            } catch (error) {
                console.error("Error fetching products or prices:", error);
                return null;
            }
}