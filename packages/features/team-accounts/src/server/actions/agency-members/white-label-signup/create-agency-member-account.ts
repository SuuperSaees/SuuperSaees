'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import type { WhiteLabelAgencyMemberSignUpData } from '../../../../../../auth/src/schemas/white-label-agency-member-sign-up.schema';

export async function createAgencyMemberAccount(
  data: WhiteLabelAgencyMemberSignUpData,
  domain: string,
  agencyId: string,
  baseUrl: string
) {
  const supabase = getSupabaseServerComponentClient({ admin: true });

  try {
    // Step 1: Create the user account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${baseUrl}/auth/confirm`,
      },
    });

    if (signUpError) {
      throw new Error(`Error creating user: ${signUpError.message}`);
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      throw new Error('Failed to create user account');
    }

    // Step 2: Update app_metadata with domain and approval status
    const appMetadata = {
      [domain]: {
        approved: false,
      },
    };

    const { error: metadataError } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: appMetadata,
    });

    if (metadataError) {
      throw new Error(`Error updating user metadata: ${metadataError.message}`);
    }

    // Step 3: Add to accounts_memberships with agency_member role
    const { error: membershipError } = await supabase
      .from('accounts_memberships')
      .insert({
        user_id: userId,
        organization_id: agencyId,
        account_role: 'agency_member',
      });

    if (membershipError) {
      throw new Error(`Error adding user to agency: ${membershipError.message}`);
    }

    // Step 4: Create user_settings entry
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        organization_id: agencyId,
      });

    if (settingsError) {
      throw new Error(`Error creating user settings: ${settingsError.message}`);
    }

    return { userId, email: data.email };

  } catch (error) {
    console.error('Error creating agency member account:', error);
    throw error;
  }
}
