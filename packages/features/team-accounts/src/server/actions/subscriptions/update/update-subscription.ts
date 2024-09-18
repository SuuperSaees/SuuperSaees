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
        propietary_organization_id: string;
        billing_customer_id: string;
        active: boolean;
        billing_provider: "stripe" | "lemon-squeezy" | "paddle";
        currency: string;
        status: "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused";
        cancel_at_period_end: boolean;
        period_starts_at: string | null; 
        period_ends_at?: string | null; 
        trial_ends_at: string | null;
        trial_starts_at: string | null;
        updated_at: string | null;
        created_at?: string | null;
    } = {
        id: subscriptionData?.id as string,
        propietary_organization_id: primary_owner_user_id as string,
        billing_customer_id: subscriptionData?.billing_customer_id as string,
        active: true,
        billing_provider: "stripe",
        currency: "usd",
        cancel_at_period_end: false,
        status: subscriptionData.status!,
        period_ends_at: null, 
        period_starts_at: null, 
        trial_ends_at: null, 
        trial_starts_at: null, 
        updated_at: null, 
        created_at: null 
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