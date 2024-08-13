'use server';

import { redirect } from 'next/navigation';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { createFile } from '../../files/create/create-file';
import { getPrimaryOwnerId } from '../../members/get/get-member-account';


type OrderInsert = Omit<Order.Insert, 'customer_id'> & {
  files?: Order.Relationships.File[];
};

export const createOrder = async (
  order: OrderInsert,
  customer_id: Order.Type['customer_id'],
) => {
  try {
    const client = getSupabaseServerComponentClient();

    const primary_owner_user_id = await getPrimaryOwnerId();

    if (!primary_owner_user_id) throw new Error('No primary owner found');
    const orderToInsert = {
      ...order,
      customer_id,
    };

    delete orderToInsert.files;
    console.log('or', orderToInsert);
    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .insert(orderToInsert)
      .select()
      .single();

    if (orderError) throw orderError.message;
    // insert metadata of the file in a new table
    if (order.files) {
      const files = await createFile(order.files);
      const orderFilesToInsert = files.map((file) => ({
        order_id: orderData.id,
        file_id: file.id,
      }));

      // append files into orders (create relationship)
      const { error: orderFilesError } = await client
        .from('order_files')
        .insert(orderFilesToInsert);

      if (orderFilesError) throw orderFilesError.message;
    }
    redirect('/orders');
  } catch (error) {
    console.error(error);
    throw error;
  }
};