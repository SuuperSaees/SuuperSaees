'use client';

import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { OrganizationSettings } from '../../../../apps/web/lib/organization-settings.types';
import { Tokens } from '../../../../apps/web/lib/tokens.types';
import { getClientConfirmEmailTemplate } from '../../../features/team-accounts/src/server/actions/clients/send-email/utils/client-confirm-email-template';
import { getTextColorBasedOnBackground } from '../../../features/team-accounts/src/server/utils/generate-colors';
import { decodeToken } from '../../../tokens/src/decode-token';
import { useSupabase } from './use-supabase';

interface Credentials {
  email: string;
  password: string;
  organizationName: string;
  emailRedirectTo: string;
  captchaToken?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
const SUUPER_CLIENT_ID = z
  .string({
    description: 'The Client id for the Suuper API',
    required_error: 'Please provide the client id for the Suuper API',
  })
  .parse(process.env.NEXT_PUBLIC_SUUPER_CLIENT_ID);

const SUUPER_CLIENT_SECRET = z
  .string({
    description: 'The Client secret for the Suuper API',
    required_error: 'Please provide the client secret for the Suuper API',
  })
  .parse(process.env.NEXT_PUBLIC_SUUPER_CLIENT_SECRET);

const defaultLogoUrl = OrganizationSettings.EXTRA_KEYS.default_sender_logo;
const defaultColor = OrganizationSettings.EXTRA_KEYS.default_sender_color;
const defaultTextColor = getTextColorBasedOnBackground(defaultColor);
const defaultOrganizationName =
  OrganizationSettings.EXTRA_KEYS.default_agency_name;
const defaultFromSenderIdentity =
  OrganizationSettings.EXTRA_KEYS.default_from_sender_identity;
  
export function useSignUpWithEmailAndPassword(currentBaseUrl?: string) {
  const client = useSupabase();
  const mutationKey = ['auth', 'sign-up-with-email-password'];
  // catch invite token
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite_token');
  const mutationFn = async (params: Credentials) => {
    const {
      emailRedirectTo,
      captchaToken,
      ...credentials
    } = params;
    let inviteRedirectUrl: string | undefined = undefined;
    // Step 1: Sign up the user

    const response = await client.auth.signUp({
      ...credentials,
      options: {
        emailRedirectTo,
        captchaToken,
      },
    });

    if (response.error) {
      throw response.error.message;
    }

    const newUserData = response.data;
    const userId = newUserData.user?.id;
    let organizationId: string | undefined;

    if (!inviteToken) {
      // New Step: Create organization account
      const { error: organizationError, data: organizationData } = await client
        .from('organizations')
        .insert({
          owner_id: userId,
          name: credentials.organizationName,
        })
        .select('id, slug')
        .single();

      if (organizationError) {
        console.error('Error creating organization:', organizationError);
        throw new Error('Error occurred while creating the organization account');
      }

      organizationId = organizationData.id;
    }

    const { error: accountInsertDataError } = await client
        .from('user_settings')
        .insert({
          user_id: userId ?? '',
          organization_id: organizationId,
        })
        .single();
    
    if (accountInsertDataError) {
      console.error('Error inserting account settings:', accountInsertDataError);
      throw new Error('Error occurred while inserting account settings');
    }

    // Step 2: Take the object session and decode the access_token as jwt to get the session id
    const sessionUserClient = newUserData?.session;
    const createdAtAndUpdatedAt = new Date().toISOString();
    const accessToken = sessionUserClient?.access_token ?? '';
    const refreshToken = sessionUserClient?.refresh_token ?? '';
    const expiresAt = new Date(
      new Date().getTime() + 86400 * 1000,
    ).toISOString();
    const providerToken = 'supabase';
    const sessionId = decodeToken(accessToken, 'base64')?.session_id as string;
    const callbackUrl = currentBaseUrl ?? baseUrl;
    const lang = 'en';
    const email = newUserData?.user?.email ?? '';

    // Step 3: Save the token in the database
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

    const { error: tokenError } = await client.from('tokens').insert(token);

    if (tokenError) {
      console.error('Error occurred while saving the token', tokenError);
      throw new Error('Error occurred while saving the token');
    }

    // Step 4: Send the email
    const { template } = getClientConfirmEmailTemplate(
      email,
      baseUrl,
      sessionId,
      callbackUrl,
      lang,
      defaultOrganizationName,
      defaultLogoUrl,
      defaultColor,
      defaultTextColor,
    );
    // don't send confirmation email if is a member invitation (/auth/sign-up?invite_token=xxxx) 
    if (inviteToken) {
      inviteRedirectUrl = `${callbackUrl}/auth/confirm?token_hash_session=${sessionId}&type=invite&callback=${encodeURIComponent(callbackUrl + '/join?invite_token=' + inviteToken + '&email=' + email)}`;

      await client.rpc('update_user_credentials', {
        p_domain: currentBaseUrl?.replace('http://', '')
                                .replace('https://', '')
                                .replace(/\/+$/, '') ?? '',
        p_email: email,
        p_password: '',
      });
    } else {
      const res = await fetch(`${baseUrl}/api/v1/mailer`, {
        method: 'POST',
        headers: new Headers({
          Authorization: `Basic ${btoa(`${SUUPER_CLIENT_ID}:${SUUPER_CLIENT_SECRET}`)}`,
        }),
        body: JSON.stringify({
          from: defaultFromSenderIdentity,
          to: [email],
          subject: 'Confirm your email',
          html: template,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to send email: ${res.statusText}`);
      }
    }

    const user = response.data?.user;
    const identities = user?.identities ?? [];

    // Step 5: If the user has no identities, it means that the email is taken
    if (identities.length === 0) {
      throw new Error('User already registered');
    }

    // Step 6: Return the user data and the invite redirect url if it exists
    return { data: response.data, inviteRedirectUrl, tokenId: sessionId };
  };

  const signUpMutation = useMutation({
    mutationKey,
    mutationFn,
  });
  return signUpMutation;
}