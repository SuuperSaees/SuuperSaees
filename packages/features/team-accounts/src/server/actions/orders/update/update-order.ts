'use server';

import { revalidatePath } from 'next/cache';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Message } from '../../../../../../../../apps/web/lib/message.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';

export const updateOrder = async (
  orderId: Order.Type['id'],
  order: Order.Update,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .update(order)
      .eq('id', orderId);

    if (orderError) throw orderError.message;
    console.log('updatedOrder:', orderData);
    revalidatePath(`/orders/${orderId}`);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const addOrderMessage = async (
  orderId: Order.Type['id'],
  message: Message.Insert,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: messageData, error: messageError } = await client
      .from('messages')
      .insert(message)
      .select()
      .single();
    console.log('messageData:', orderId, message);
    if (messageError) throw messageError.message;
    console.log('addedMessage:', messageData);
    revalidatePath(`/orders/${orderId}`);
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};