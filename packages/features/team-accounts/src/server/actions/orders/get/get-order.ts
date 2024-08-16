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
      .select(
        '*, client:clients (id, name, email, created_at, picture_url), messages(*, user:accounts(*))',
      )
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError.message;

    // Process messages to flatten the user relationship
    // const processedData = {
    //   ...orderData,
    //   messages: orderData.messages.map(message => ({
    //     ...message,
    //     user: message.user[0]
    //   }))
    // };
    const proccesedData = {
      ...orderData,
      messages: orderData.messages.map((message, msgIdx) => {
        return {
          ...message,
          user: message.user,
        };
      }),
    };

    console.log('a', orderData.messages[0]?.user, proccesedData);

    return proccesedData;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};