'use server';

import { revalidatePath } from 'next/cache';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Activity } from '../../../../../../../../apps/web/lib/activity.types';
import { Message } from '../../../../../../../../apps/web/lib/message.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { addActivityAction } from '../../activity/create/create-activity';
import { sendOrderMessageEmail } from '../send-mail/send-order-message-email'
import { sendOrderStatusPriorityEmail } from '../send-mail/send-order-status-priority'
import { getUserById, getEmails, getOrganizationName } from '../get/get-mail-info';

const statusTranslations = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  in_review: 'En revisión',
  completed: 'Completado',
  annulled: 'Anulado',
};

const priorityTranslations = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

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
    // console.log('updatedOrder:', orderData);

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

export const updateOrderAssigns = async (
  orderId: Order.Type['id'],
  agencyMemberIds: string[],
) => {
  try {
    const client = getSupabaseServerComponentClient();

    // 1. Fetch existing assignments to determine if you need to delete any
    const { data: existingAssignments, error: fetchError } = await client
      .from('order_assignations')
      .select('agency_member_id')
      .eq('order_id', orderId);

    if (fetchError) throw fetchError;

    // Extract existing IDs
    const existingIds =
      existingAssignments?.map((assign) => assign.agency_member_id) || [];

    // Determine IDs to add and remove
    const idsToAdd = agencyMemberIds.filter((id) => !existingIds.includes(id));
    const idsToRemove = existingIds.filter(
      (id) => !agencyMemberIds.includes(id),
    );

    // 2. Remove old assignments
    if (idsToRemove.length > 0) {
      const { error: deleteError } = await client
        .from('order_assignations')
        .delete()
        .in('agency_member_id', idsToRemove)
        .eq('order_id', orderId);

      if (deleteError) throw deleteError;
    }

    // 3. Upsert new assignments
    const newAssignments = idsToAdd.map((id) => ({
      order_id: orderId,
      agency_member_id: id,
    }));

    const { error: upsertError } = await client
      .from('order_assignations')
      .upsert(newAssignments)
      .select();

    if (upsertError) throw upsertError;

    revalidatePath(`/orders/${orderId}`);
  } catch (error) {
    console.error('Error updating order assignments:', error);
    throw new Error('Failed to update order assignments');
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
        // console.log('addedActivity:', message, userNameOrEmail);

        let translatedValue = value;

        
        if (field === 'status') {
          translatedValue = statusTranslations[value as keyof typeof statusTranslations] || value;
          const emailsData = await getEmails(orderId.toString());
          const organizationName = await getOrganizationName();
          const agencyName = organizationName ?? '';

          for (const email of emailsData) {
            if (email) {
              await sendOrderStatusPriorityEmail(
                email,
                `${type}`,
                orderId.toString(),
                `El estado ha sido cambiado a  ${translatedValue}`,
                agencyName,
                new Date().toLocaleDateString() // Or format as needed
              );
            } else {
              console.warn('Email is null or undefined, skipping...');
            }
          }
        } else if (field === 'priority') {
          translatedValue = priorityTranslations[value as keyof typeof priorityTranslations] || value;
          const emailsData = await getEmails(orderId.toString());
          const organizationName = await getOrganizationName();
          const agencyName = organizationName ?? '';

          for (const email of emailsData) {
            if (email) {
              await sendOrderStatusPriorityEmail(
                email,
                `${type}`,
                orderId.toString(),
                `La prioridad ha sido cambiada a ${translatedValue}`,
                agencyName,
                new Date().toLocaleDateString() // Or format as needed
              );
            } else {
              console.warn('Email is null or undefined, skipping...');
            }
          }
        }
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

    const clientData = await getUserById(userData.user.id);
    const emailsData = await getEmails(orderId.toString());
    const organizationName = await getOrganizationName();

    const agencyName = organizationName ?? '';
    const clientName = clientData?.name ?? '';

    const { data: messageData, error: messageError } = await client
      .from('messages')
      .insert({
        ...message,
        user_id: userData.user.id,
        order_id: orderId,
      })
      .select()
      .single();
    // console.log('messageData:', orderId, message);
    if (messageError) throw messageError.message;
    

    for (const email of emailsData) {
      if (email) {
        const messageContent = messageData.content ?? 'No message content';
        await sendOrderMessageEmail(
          email,
          clientName,
          orderId.toString(),
          messageContent,
          agencyName,
          new Date().toLocaleDateString()  
        );
      } else {
        console.warn('Email is null or undefined, skipping...');
      }
    }
    
    // revalidatePath(`/orders/${orderId}`);
    return messageData
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};