'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const putDueDate = async (orderData: {
    id: string
    created_at: string
    title: string
    description: string | null
    customer_id: string
    status: string
    assigned_to: string[] | null
    due_date: string 
    propietary_organization_id: string
}) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('orders_v2')
      .update(orderData)
      .eq('id', orderData.id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al crear el cliente:', error);
  }
};
