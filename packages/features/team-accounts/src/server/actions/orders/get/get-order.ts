'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Order } from '../../../../../../../../apps/web/lib/order.types';

export const getOrderById = async (orderId: Order.Type['id']) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select('*, client:clients (id, name, email, created_at, picture_url)')
      .eq('id', orderId)
      .single();
    console.log('orderData', orderData);
    if (orderError) throw orderError.message;

    return orderData;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};
