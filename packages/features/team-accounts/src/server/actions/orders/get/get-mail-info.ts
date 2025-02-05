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

    const { data: followersData, error: followersError } = await client
      .from('order_followers')
      .select('client_member_id')
      .eq('order_id', orderId);

    if (followersError) throw followersError;

    const agencyMemberIds = assignationsData.map(assignation => assignation.agency_member_id);

    // Query to get the agency id
    const { data: agencyData, error: agencyError } = await client
      .from('orders_v2')
      .select('agency_id')
      .eq('id', orderId)
      .single();

    if (agencyError) throw agencyError;

    const agencyId = agencyData.agency_id;

    // Query to get the project manager from accounts memberships

    const { data: projectManagerData, error: projectManagerError } = await client
      .from('accounts_memberships')
      .select('user_id')
      .eq('account_id', agencyId)
      .eq('account_role', 'agency_project_manager')
      .single();

    if (projectManagerError) throw projectManagerError;

    const projectManagerId = projectManagerData.user_id;
    
    agencyMemberIds.push(projectManagerId);

    const clientMemberIds = followersData.map(follower => follower.client_member_id);

    if (agencyMemberIds.length === 0 && clientMemberIds.length === 0) return []; // If there are no assignations or followers, return an empty array

    const memberIds = [...agencyMemberIds, ...clientMemberIds];

    // Query to get the emails of the agency members
    const { data: emailData, error: emailError } = await client
      .from('accounts')
      .select('email')
      .in('id', memberIds);


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

