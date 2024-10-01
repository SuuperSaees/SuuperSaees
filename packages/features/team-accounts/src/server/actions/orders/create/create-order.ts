'use server';

import { redirect } from 'next/navigation';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { hasPermissionToCreateOrder } from '../../permissions/orders';
import { sendOrderCreationEmail } from '../send-mail/send-order-email';


type OrderInsert = Omit<Order.Insert, 'customer_id'> & {
  fileIds?: string[];
};

export const createOrders = async (orders: OrderInsert[]) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);
    const userId = userData.user.id;

    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select()
      .eq('id', userId)
      .single();
    if (accountError) throw new Error(accountError.message);

    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('*')
      .eq('user_client_id', userId)
      .single();
    if (clientError && clientError.code !== 'PGRST116') {
      console.error('clientError', clientError);
      throw new Error(clientError.message);
    }

    const agencyClientId =
      clientData?.agency_id ?? accountData.organization_id ?? '';
    const clientOrganizationId =
      clientData?.organization_client_id ?? accountData.organization_id;

    const { data: agencyOrganizationData, error: agencyOrganizationError } =
      await client
        .from('accounts')
        .select('id, primary_owner_user_id, name')
        .eq('id', agencyClientId)
        .single();
    if (agencyOrganizationError)
      throw new Error(agencyOrganizationError.message);

    const { data: emailData, error: emailError } = await client
      .from('accounts')
      .select('id, email')
      .eq('id', agencyOrganizationData.primary_owner_user_id)
      .single();
    if (emailError) throw new Error(emailError.message);

    const { data: roleData, error: roleError } = await client
      .from('accounts_memberships')
      .select('account_role')
      .eq('user_id', userId)
      .single();
    if (roleError) throw new Error(roleError.message);

    // Step 1: Check if the user has permission to create orders
    const hasPermission = await hasPermissionToCreateOrder(
      agencyClientId,
      clientOrganizationId ?? '',
    );
    if (!hasPermission) {
      throw new Error('You do not have permission to create orders.');
    }

    // Step 2: Prepare the orders for insertion
    const ordersToInsert = orders.map(
      ({ fileIds, ...orderWithoutFileIds }) => ({
        ...orderWithoutFileIds,
        customer_id: userId,
        client_organization_id: clientOrganizationId,
        propietary_organization_id:
          agencyOrganizationData.primary_owner_user_id,
        agency_id: agencyOrganizationData.id,
      }),
    );

    // Step 3: Insert orders into the database
    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .insert(ordersToInsert)
      .select()
      .single();
    if (orderError) throw new Error(orderError.message);

    // Step 4: Send email notification
    if (emailData.email) {
      await sendOrderCreationEmail(
        emailData.email,
        orderData.id.toString(),
        orderData,
        agencyOrganizationData.name ?? '',
      );
    }

    // Step 5: Insert order files if present
    for (const order of orders) {
      if (order.fileIds && order.fileIds.length > 0) {
        for (const fileId of order.fileIds) {
          const orderFileToInsert = {
            order_id: orderData.uuid,
            file_id: fileId,
          };

          const { error: orderFilesError } = await client
            .from('order_files')
            .insert(orderFileToInsert);

          if (orderFilesError) throw new Error(orderFilesError.message);
        }
      }
    }

    // Step 6: Assign agency members to the order
    const agencyRoles = new Set([
      'agency_owner',
      'agency_member',
      'agency_project_manager',
    ]);

    if (agencyRoles.has(roleData.account_role)) {
      const assignationData = {
        agency_member_id: userId,
        order_id: orderData.id,
      };
      const { error: assignedOrdersError } = await client
        .from('order_assignations')
        .insert(assignationData);
      if (assignedOrdersError) throw new Error(assignedOrdersError.message);
    }

    // Step 7: Add order follow-up for client owners/members
    if (['client_owner', 'client_member'].includes(roleData.account_role)) {
      const followUpData = {
        order_id: orderData.id,
        client_member_id: userId,
      };

      const { error: followUpError } = await client
        .from('order_followers')
        .insert(followUpData);
      if (followUpError) throw new Error(followUpError.message);
    }

    // Step 8: Redirect to orders page after successful order creation
    redirect('/orders');
  } catch (error) {
    console.error(error);
    throw error;
  }
};