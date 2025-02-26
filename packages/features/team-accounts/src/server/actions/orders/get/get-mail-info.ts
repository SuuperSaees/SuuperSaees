'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export async function getEmails(orderId: string, rolesAvailable?: string[], userId?: string) {
  try {
    const client = getSupabaseServerComponentClient({
      admin: true,
    });

    const { data: assignationsData, error: assignationsError } = await client
      .from('order_assignations')
      .select('agency_member_id')
      .eq('order_id', orderId);

    if (assignationsError) throw assignationsError;

    const { data: followersData, error: followersError } = await client
      .from('order_followers')
      .select('client_member_id')
      .eq('order_id', orderId);

    if (followersError) throw followersError;

    const agencyMemberIds = assignationsData.map(assignation => assignation.agency_member_id);
    const clientMemberIds = followersData.map(follower => follower.client_member_id);

    if (agencyMemberIds.length === 0 && clientMemberIds.length === 0) return []; // Si no hay asignaciones, retorna un arreglo vacío

    let memberIds = [...agencyMemberIds, ...clientMemberIds];
    // Filter by rolesAvailable
    if (rolesAvailable && rolesAvailable.length > 0) {
      const { data: accountsByRolesData, error: accountsByRolesError } = await client
        .from('accounts_memberships')
        .select('user_id')
        .in('user_id', memberIds)
        .in('account_role', rolesAvailable);

      if (accountsByRolesError) throw accountsByRolesError;

      memberIds = accountsByRolesData.map(account => account.user_id);
    }

    // Query to get the emails of the agency members
    let query = client
    .from('accounts')
    .select('email')
    .in('id', memberIds);
  
    // Only apply the userId filter if it exists
    if (userId) {
      query = query.not('id', 'eq', userId);
    }

  const { data: emailData, error: emailError } = await query;

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

