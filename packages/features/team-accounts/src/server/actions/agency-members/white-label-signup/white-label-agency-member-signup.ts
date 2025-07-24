'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import type { Json } from '@kit/supabase/database';
import { 
  WhiteLabelAgencyMemberSignUpSchema, 
  type WhiteLabelAgencyMemberSignUpData 
} from '../../../../../../auth/src/schemas/white-label-agency-member-sign-up.schema';
import { sendAgencyMemberApprovalEmail } from './send-agency-member-approval-email';

export async function whiteLabelAgencyMemberSignUp(
  data: WhiteLabelAgencyMemberSignUpData, 
  host: string, 
  agencyId: string
) {
  try {
    // Validate the input data
    const validatedData = WhiteLabelAgencyMemberSignUpSchema.parse(data);

    const baseUrl = `${host === 'localhost:3000' ? 'http://' : 'https://'}${host}`;
    const domain = host;

    const supabase = getSupabaseServerComponentClient({ admin: true });
    
    // Check if user already exists
    const { data: existingAccount } = await supabase
      .from('accounts')
      .select('id, email, public_data')
      .eq('email', validatedData.email)
      .single();

    let userId: string;

    if (existingAccount) {
      // Check if user exists in this agency
      const { data: existingMembership } = await supabase
        .from('accounts_memberships')
        .select('*')
        .eq('user_id', existingAccount.id)
        .eq('organization_id', agencyId)
        .single();

      if (existingMembership) {
        throw new Error('This email is already registered with this agency');
      }

      // User exists but not in this agency
      userId = existingAccount.id;
    } else {
      // Create new user account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${baseUrl}/auth/confirm`,
        },
      });

      if (signUpError) {
        throw new Error(`Error creating user: ${signUpError.message}`);
      }

      const newUserId = signUpData.user?.id;
      if (!newUserId) {
        throw new Error('Failed to create user account');
      }
      userId = newUserId;
    }

    // Get current user data to preserve existing metadata
    const { data: currentUser } = await supabase.auth.admin.getUserById(userId);
    
    // Update app_metadata preserving existing data
    const currentAppMetadata = currentUser.user?.app_metadata ?? {};
    const updatedAppMetadata = {
      ...currentAppMetadata,
      [domain]: {
        approved: false,
      },
    };

    const { error: metadataError } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: updatedAppMetadata,
    });

    if (metadataError) {
      throw new Error(`Error updating user metadata: ${metadataError.message}`);
    }

    // Update public_data in accounts table preserving existing data
    const currentPublicData = (existingAccount?.public_data as Record<string, unknown>) ?? {};
    const updatedPublicData = {
      ...currentPublicData,
      [domain]: {
        approved: false,
      },
    } as Record<string, unknown>;

    const { error: publicDataError } = await supabase
      .from('accounts')
      .update({
        public_data: updatedPublicData as Json,
      })
      .eq('id', userId);

    if (publicDataError) {
      throw new Error(`Error updating account public data: ${publicDataError.message}`);
    }

    // Add to accounts_memberships with agency_member role
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

    // Create user_settings entry (or update if exists)
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', agencyId)
      .single();

    if (!existingSettings) {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          organization_id: agencyId,
        });

      if (settingsError) {
        throw new Error(`Error creating user settings: ${settingsError.message}`);
      }
    }

    await supabase.rpc('update_user_credentials', {
      p_domain: host,
      p_email: validatedData.email,
      p_password: '',
    });

    // Send notification email to agency owner
    try {
      await sendAgencyMemberApprovalEmail(
        validatedData.email,
        agencyId,
        baseUrl
      );
      console.log(`Notification email sent for new member registration: ${validatedData.email}`);
    } catch (emailError) {
      // Log email error but don't fail the registration
      console.error('Failed to send notification email:', emailError);
    }

    console.log(`Agency member ${validatedData.email} registered successfully`);

  } catch (error) {
    console.error('White label agency member signup error:', error);
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error('Registration failed. Please try again.');
  }

  return { success: true };
}
