'use server'
import { getSupabaseServerComponentClient } from "@kit/supabase/server-component-client";


export const deleteOrderByUuid = async (
  orderUuid: string
) => {
  try {  
    const client = getSupabaseServerComponentClient();

    const { error } = await client
      .from('orders_v2')
      .update({
          deleted_on: new Date().toDateString()
      })
      .eq('uuid', orderUuid);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error deleting the order:', error);
    throw error;
  }
};