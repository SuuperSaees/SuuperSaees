'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export async function approveAgencyMember(
  userId: string,
  domain: string,
  currentPath?: string
) {
  try {
    const supabase = getSupabaseServerComponentClient({ admin: true });
    
    // Use the RPC function to approve the member
    const { data: success, error } = await supabase.rpc('approve_agency_member', {
      p_user_id: userId,
      p_domain: domain,
    });

    if (error) {
      console.error('Error approving agency member:', error);
      throw new Error(`Failed to approve member: ${error.message}`);
    }

    if (!success) {
      throw new Error('Failed to approve member: RPC returned false');
    }

    console.log(`Successfully approved agency member ${userId} for domain ${domain}`);

    // Revalidate the current path to refresh the data
    if (currentPath) {
      revalidatePath(currentPath);
    } else {
      revalidatePath('/team');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in approveAgencyMember action:', error);
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error('Failed to approve agency member');
  }
}

export async function approveAgencyMemberAndRedirect(
  userId: string,
  domain: string,
  redirectPath = '/team'
) {
  try {
    await approveAgencyMember(userId, domain);
    
    // Redirect after successful approval
    redirect(redirectPath);
  } catch (error) {
    console.error('Error in approveAgencyMemberAndRedirect:', error);
    throw error;
  }
}
