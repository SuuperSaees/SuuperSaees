'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import type { Json } from '@kit/supabase/database';
import { 
  WhiteLabelAgencyMemberSignUpSchema, 
  type WhiteLabelAgencyMemberSignUpData 
} from '../../../../../../auth/src/schemas/white-label-agency-member-sign-up.schema';
import { sendEmail } from '../../../../../../../../apps/web/app/server/services/send-email.service';
import { EMAIL } from '../../../../../../../../apps/web/app/server/services/email.types';
import { getAgencyOwner } from '../../members/get/get-member-account';
import { decodeToken } from '../../../../../../../tokens/src/decode-token';
import { Tokens } from '../../../../../../../../apps/web/lib/tokens.types';

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


      // Generate token and send confirmation email to the new agency member
    try {
      
      if (signUpError) {
        console.error('Error occurred while creating the agency member user session:', signUpError);
      } else if (signUpData.session) {
        // Extract session data
        const sessionUserAgencyMember = signUpData.session;
        const createdAtAndUpdatedAt = new Date().toISOString();
        const accessToken = sessionUserAgencyMember?.access_token ?? '';
        const refreshToken = sessionUserAgencyMember?.refresh_token ?? '';
        const expiresAt = new Date(new Date().getTime() + 3600 * 1000).toISOString();
        const providerToken = 'supabase';
        const sessionId = (decodeToken(accessToken, 'base64') as { session_id: string })?.session_id;
        const callbackUrl = `${baseUrl}/orders`; // Agency members go to orders page after confirmation

        // Save the token in the database
        const token: Tokens.Insert = {
          id: sessionId,
          id_token_provider: sessionId,
          created_at: createdAtAndUpdatedAt,
          updated_at: createdAtAndUpdatedAt,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
          provider: providerToken,
        };

        const { error: tokenError } = await supabase.from('tokens').insert(token);

        if (tokenError) {
          console.error('Error occurred while saving the token', tokenError);
        } else {
          // Get agency name for the confirmation email
          const { data: organization } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', agencyId)
            .single();

          // Send confirmation email to the agency member
          await sendEmail(EMAIL.AGENCY_MEMBERS.ACCOUNT_CONFIRMATION, {
            to: validatedData.email,
            userId: signUpData?.user?.id ?? '', // Use agency member user ID as context
            agencyName: organization?.name ?? '',
            sessionId: sessionId,
            callbackUrl: `${baseUrl}/auth/confirm?token_hash_session=${sessionId}&type=invite&callback=${callbackUrl}`,
            domain: baseUrl,
            agencyId: agencyId,
          });

        }
      }
    } catch (confirmationEmailError) {
      // Log error but don't fail the registration
      console.error('Failed to send confirmation email to agency member:', confirmationEmailError);
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

    
    // Send notification email to agency owner using the standard email system
    try {
      // Get agency owner information
      const agencyOwnerData = await getAgencyOwner(agencyId);
      
      // Get agency name for the email
      const { data: organization } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', agencyId)
        .single();
      
      if (agencyOwnerData?.email && organization) {
        const registrationDate = new Date().toLocaleDateString();
        
        await sendEmail(EMAIL.AGENCY_MEMBERS.NEW_REGISTRATION, {
          to: agencyOwnerData.email,
          userId: agencyOwnerData.owner_id, // Use agency ID as context
          memberEmail: validatedData.email,
          agencyName: organization.name ?? '',
          registrationDate: registrationDate,
          agencyId,
          domain: baseUrl,
          buttonUrl: `${baseUrl}/team`
        });
        
        console.log(`Notification email sent to agency owner: ${agencyOwnerData.email} for new member: ${validatedData.email}`);
      } else {
        console.warn('Could not find agency owner email or organization data for notification');
      }
    } catch (emailError) {
      // Log email error but don't fail the registration
      console.error('Failed to send notification email to agency owner:', emailError);
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
