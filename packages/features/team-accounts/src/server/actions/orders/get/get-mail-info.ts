'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

// get a given user

export async function getUserById(userId: string) {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userAuthenticatedError } = await client.auth.getUser();

    if (userAuthenticatedError) throw userAuthenticatedError;

    const { data: userData, error: userError } = await client
      .from('accounts')
      .select('name, email, id, picture_url, primary_owner_user_id')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    return userData;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

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


export async function getOrganizationName() {
    try {
      const client = getSupabaseServerComponentClient();
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) throw userError;
  
      const { data: accountsData , error: accountsError } = await client
        .from('accounts')
        .select()
        .eq('id', userData.user.id)
        .single();
      
      if (accountsError) throw accountsError;
      
      const organizationId = accountsData?.organization_id;
  
      if (!organizationId) {
        throw new Error('Organization ID is null');
      }
  
      const { data: organizationsData , error: organizationsError } = await client
        .from('accounts')
        .select()
        .eq('id', organizationId)
        .single();
      
      if (organizationsError) throw organizationsError;
  
      const organizationName = organizationsData?.name;
  
      return organizationName;
  
    } catch (error) {
      console.error('Error fetching primary owner:', error);
    }
  }