'use server';

import { revalidatePath } from 'next/cache';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Activity } from '../../../../../../../../apps/web/lib/activity.types';
import { Message } from '../../../../../../../../apps/web/lib/message.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { addActivityAction } from '../../activity/create/create-activity';


export const updateOrder = async (
  orderId: Order.Type['id'],
  order: Order.Update,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError, data: userData } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .update(order)
      .eq('id', orderId);

    if (orderError) throw orderError.message;
    console.log('updatedOrder:', orderData);

    const userNameOrEmail =
      userData?.user.user_metadata?.name || userData?.user.user_metadata?.email;

    // Call the abstracted activity logging function
    await logOrderActivities(orderId, order, userData.user.id, userNameOrEmail);

    revalidatePath(`/orders/${orderId}`);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

const logOrderActivities = async (
  orderId: Order.Type['id'],
  order: Order.Update,
  userId: string,
  userNameOrEmail: string,
) => {
  try {
    const logActivity = async (
      type: Activity.Enums.ActivityType,
      field: keyof Order.Update,
      value: string,
    ) => {
      if (field in order) {
        const message = `has changed`;
        const activity = {
          actor: userNameOrEmail.split('@')[0] ?? userNameOrEmail,
          action: Activity.Enums.ActionType.UPDATE,
          type,
          message,
          value,
          preposition: `to`,
          order_id: orderId,
          user_id: userId,
        };
        await addActivityAction(activity);
        console.log('addedActivity:', message, userNameOrEmail);
      }
    };

    // Log activities for the updated fields
    await logActivity(
      Activity.Enums.ActivityType.STATUS,
      'status',
      order.status ?? '',
    );
    await logActivity(
      Activity.Enums.ActivityType.PRIORITY,
      'priority',
      order.priority ?? '',
    );
    await logActivity(
      Activity.Enums.ActivityType.DUE_DATE,
      'due_date',
      order.due_date ?? '',
    );
    await logActivity(
      Activity.Enums.ActivityType.DESCRIPTION,
      'description',
      order.description ?? '',
    );
    await logActivity(
      Activity.Enums.ActivityType.TITLE,
      'title',
      order.title ?? '',
    );
  } catch (error) {
    console.error('Error logging order activities:', error);
    throw error;
  }
};

export const addOrderMessage = async (
  orderId: Order.Type['id'],
  message: Omit<Message.Insert, Message.Insert['user_id']>,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: messageData, error: messageError } = await client
      .from('messages')
      .insert({
        ...message,
        user_id: userData.user.id,
        order_id: orderId,
      })
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