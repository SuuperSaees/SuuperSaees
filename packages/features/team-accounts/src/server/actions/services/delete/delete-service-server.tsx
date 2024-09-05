'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getStripeAccountID } from '../../members/get/get-member-account';

// const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const deleteService = async (priceId: string) => {
  try {

    const stripe_account_id = await getStripeAccountID();
    if (!stripe_account_id) throw new Error('No stripe account found');      

    const client = getSupabaseServerComponentClient();
    // Delete From DB
    const { error } = await client
      .from('services')
      .delete()
      .eq('price_id', priceId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
};