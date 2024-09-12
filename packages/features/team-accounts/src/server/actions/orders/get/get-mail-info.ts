'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export async function getEmails(orderId: string) {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userAuthenticatedError } = await client.auth.getUser();

    if (userAuthenticatedError) throw userAuthenticatedError;

    const { data: assignationsData, error: assignationsError } = await client
      .from('order_assignations')
      .select('agency_member_id')
      .eq('order_id', orderId);

    if (assignationsError) throw assignationsError;

    const agencyMemberIds = assignationsData.map(assignation => assignation.agency_member_id);

    if (agencyMemberIds.length === 0) return []; // Si no hay asignaciones, retorna un arreglo vacío

    // Consulta para obtener los correos electrónicos de los miembros de la agencia
    const { data: emailData, error: emailError } = await client
      .from('accounts')
      .select('email')
      .in('id', agencyMemberIds);

      if (emailError) throw emailError;

      const emails = emailData.map(member => member.email);
  
      return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

export async function getOrderInfo(orderId: string) {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userAuthenticatedError } = await client.auth.getUser();

    if (userAuthenticatedError) throw userAuthenticatedError;

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    return orderData;
  } catch (error) {
    console.error('Error fetching order info:', error);
    throw error;
  }
}

