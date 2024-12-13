'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Activity } from '../../../../../../../../apps/web/lib/activity.types';
import { Message } from '../../../../../../../../apps/web/lib/message.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { User } from '../../../../../../../../apps/web/lib/user.types';
import { addActivityAction } from '../../activity/create/create-activity';
import { getUserById } from '../../members/get/get-member-account';
import { getOrganization } from '../../organizations/get/get-organizations';
import { getEmails, getOrderInfo } from '../get/get-mail-info';
import { sendOrderMessageEmail } from '../send-mail/send-order-message-email';
import { sendOrderStatusPriorityEmail } from '../send-mail/send-order-status-priority';

const statusTranslations = {
  pending: 'Pending',
  in_progress: 'In progres',
  in_review: 'In review',
  completed: 'Completed',
  annulled: 'Annulled',
};

const priorityTranslations = {
  high: 'High',
  medium: 'Medium',
  low: 'Baja',
};

export const updateOrder = async (
  orderId: Order.Type['id'],
  order: Order.Update,
  userName?: string,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError, data: userData } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: updatedData, error: orderError } = await client
      .from('orders_v2')
      .update({
        ...order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) throw orderError.message;
    // console.log('updatedOrder:', orderData);

    const userNameOrEmail = userName ??
      (userData?.user.user_metadata?.name || userData?.user.user_metadata?.email);

    // Call the abstracted activity logging function
    await logOrderActivities(orderId, order, userData.user.id, userNameOrEmail);
    return updatedData;
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

const handleFieldUpdate = async (
  field: keyof Order.Update,
  value: string,
  orderId: Order.Type['id'],
  type: Activity.Enums.ActivityType,
) => {
  const client = getSupabaseServerComponentClient();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError.message;

  let translatedValue = value;

  if (field === 'status') {
    translatedValue =
      statusTranslations[value as keyof typeof statusTranslations] || value;
  } else if (field === 'priority') {
    translatedValue =
      priorityTranslations[value as keyof typeof priorityTranslations] || value;
  } else if (field === 'due_date') {
    translatedValue = new Date(value).toLocaleDateString();
  }

  const emailsData = await getEmails(orderId.toString());
  const actualName = await getUserById(userData.user.id);
  const organization = await getOrganization();
  const organizationName = organization?.name;
  const agencyName = organizationName ?? '';
  const orderInfo = await getOrderInfo(orderId.toString());

  for (const email of emailsData) {
    if (email) {
      await sendOrderStatusPriorityEmail(
        email,
        `${actualName?.name ?? ''}`,
        `${type}`,
        orderId.toString(),
        orderInfo?.title ?? '',
        field === 'status' ? `${translatedValue}` : `${translatedValue}`,
        agencyName,
        userData?.user.id ?? '',
      );
    } else {
      console.warn('Email is null or undefined, skipping...');
    }
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

        await handleFieldUpdate(field, value, orderId, type);
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
  userId: User.Response['id'],
  orderId: Order.Type['id'],
  message: Omit<Message.Insert, Message.Insert['user_id']>,
  visibility: Message.Type['visibility'],
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: messageData, error: messageError } = await client
      .from('messages')
      .insert({
        ...message,
        user_id: userId,
        order_id: orderId,
        visibility,
      })
      .select()
      .single();

    if (messageError)
      throw new Error(`Error adding message, ${messageError.message}`);

    // revalidatePath(`/orders/${orderId}`);
    return messageData;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

export const sendEmailsOfOrderMessages = async (
  orderId: number,
  title: Order.Response['title'],
  content: string,
  sender: User.Response['name'],
  assigneesEmails: User.Response['email'][],
  agencyName: Account.Type['name'],
  date = new Date().toLocaleDateString(),
  userId: User.Response['id'],
) => {
  try {
    // Send email to assignees
    const emailPromises = assigneesEmails.map((assigneeEmail) => {
      if (assigneeEmail) {
        return sendOrderMessageEmail(
          assigneeEmail,
          sender,
          orderId.toString(),
          title,
          content,
          agencyName,
          date,
          userId,
        );
      } else {
        console.warn('Email is null or undefined, skipping...');
        return Promise.resolve(); // or alternatively, Promise.reject() if you want to handle rejections
      }
    });
    await Promise.all(emailPromises);
  } catch (error) {
    console.warn('Error sending email of order messages, skipping:', error);
  }
};

export const updateOrderFollowers = async (
  orderId: Order.Type['id'],
  followerIds: string[],
) => {
  try {
    const client = getSupabaseServerComponentClient();

    // 1. Fetch existing followers to determine if you need to delete any
    const { data: existingFollowers, error: fetchError } = await client
      .from('order_followers')
      .select('client_member_id')
      .eq('order_id', orderId);

    if (fetchError) throw fetchError;

    // Extract existing IDs
    const existingIds =
      existingFollowers?.map(
        (follower) => follower.client_member_id as string,
      ) || [];

    // Determine IDs to add and remove
    const idsToAdd = followerIds.filter((id) => !existingIds.includes(id));
    const idsToRemove = existingIds.filter((id) => !followerIds.includes(id));

    // Remove old followers
    if (idsToRemove.length > 0) {
      const { error: deleteError } = await client
        .from('order_followers')
        .delete()
        .in('client_member_id', idsToRemove)
        .eq('order_id', orderId);

      if (deleteError) throw deleteError;
    }

    // Add new followers
    const newFollowers = idsToAdd.map((id) => ({
      order_id: orderId,
      client_member_id: id,
    }));

    const { error: upsertError } = await client
      .from('order_followers')
      .upsert(newFollowers);

    if (upsertError) throw upsertError;

    revalidatePath(`/orders/${orderId}`);
  } catch (error) {
    console.error('Error updating order followers:', error);
    throw error;
  }
};
