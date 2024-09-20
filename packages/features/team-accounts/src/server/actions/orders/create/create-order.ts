'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { sendOrderCreationEmail } from '../send-mail/send-order-email';




type OrderInsert = Omit<Order.Insert, 'customer_id'> & {
  fileIds?: string[];
};




export const createOrders = async (orders: OrderInsert[]) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;
    const userId = userData.user.id;

    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select()
      .eq('id', userId)
      .single();
    if (accountError) throw accountError.message;


    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('*')
      .eq('user_client_id', userId)
      .single();
    if (clientError && clientError.code !== 'PGRST116') {
      console.error('clientError', clientError);
      throw clientError.message;
    }

    const agency_client_id =
      clientData?.agency_id ?? accountData.organization_id ?? '';
    const clientOrganizationId =
      clientData?.organization_client_id ?? accountData.organization_id;

    const { data: agencyOrganizationData, error: agencyOrganizationError } =
      await client
        .from('accounts')
        .select('id, primary_owner_user_id, name') 
        .eq('id', agency_client_id)
        .single();
    if (agencyOrganizationError) throw agencyOrganizationError.message;

    const { data: emailData, error: emailError } =
      await client
        .from('accounts')
        .select('id, email') 
        .eq('id', agencyOrganizationData.primary_owner_user_id)
        .single();
    if (emailError) throw emailError.message;

    const { data: roleData, error: roleError } = await client
      .from('accounts_memberships')
      .select('account_role')
      .eq('user_id', userId)
      .single();
    if (roleError) throw roleError.message


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

    

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .insert(ordersToInsert)
      .select()
      .single();
    if (orderError) throw orderError.message;

    if (emailData.email) {
      await sendOrderCreationEmail(emailData.email, orderData.id.toString(), orderData, agencyOrganizationData.name ?? "");
    }

    
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

          if (orderFilesError) throw orderFilesError.message;
        }
      }
    }

    

    if (roleData.account_role === 'agency_owner' || roleData.account_role === 'agency_member' || roleData.account_role === 'agency_project_manager') {
      const assignationData = {
        agency_member_id: userId,
        order_id: orderData.id,
      }
      const {error: assignedOrdersError } = await client
        .from('order_assignations')
        .insert(assignationData);
      if (assignedOrdersError) throw assignedOrdersError.message;


    }

    
    redirect('/orders');
  } catch (error) {
    console.error(error);
    throw error;
  }
};
