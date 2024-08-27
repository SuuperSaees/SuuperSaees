'use server';

import { redirect } from 'next/navigation';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Order } from '../../../../../../../../apps/web/lib/order.types';

type OrderInsert = Omit<Order.Insert, 'customer_id'> & {
  fileIds?: string[];
};

export const createOrders = async (orders: OrderInsert[]) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;
    const userId = userData.user.id;

    // console.log('userId', userId);
    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('*')
      .eq('user_client_id', userId)
      .single();
    if (clientError) {
      console.error('clientError', clientError);
      throw clientError.message;
    }
    const agency_client_id = clientData.agency_id;
    // const primary_owner_user_id = agency_client_id;

    const { data: agencyOrganizationData, error: agencyOrganizationError } =
      await client
        .from('accounts')
        .select('id, primary_owner_user_id')
        .eq('id', agency_client_id)
        .single();
    if (agencyOrganizationError) throw agencyOrganizationError.message;

    // const ordersToInsert = orders.map((order) => ({
    //   ...order,
    //   customer_id: userId,
    //   propietary_organization_id: primary_owner_user_id,
    // }));
    const ordersToInsert = orders.map(
      ({ fileIds, ...orderWithoutFileIds }) => ({
        ...orderWithoutFileIds,
        customer_id: userId,
        client_organization_id: clientData.organization_client_id,
        propietary_organization_id:
          agencyOrganizationData.primary_owner_user_id,
        agency_id: agencyOrganizationData.id,
      }),
    );

    console.log('ordersToInsert', ordersToInsert);

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .insert(ordersToInsert)
      .select()
      .single();

    console.log('orderData', orderData);

    if (orderError) throw orderError.message;

    // Itera sobre las órdenes y sobre los fileIds dentro de cada orden
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

    // insert metadata of the file in a new table
    // if (orders.files) {
    //   const files = await createFile(orders.files);
    //   const orderFilesToInsert = files.map((file) => ({
    //     order_id: orderData.id,
    //     file_id: file.id,
    //   }));

    // //   // append files into orders (create relationship)
    //     const { error: orderFilesError } = await client
    //       .from('order_files')
    //       .insert(orderFilesToInsert);

    //     if (orderFilesError) throw orderFilesError.message;
    // }
    redirect('/orders');
  } catch (error) {
    console.error(error);
    throw error;
  }
};