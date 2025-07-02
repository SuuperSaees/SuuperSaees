import type { UserAttributes } from '@supabase/gotrue-js';

import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { useSupabase } from './use-supabase';
import { OrganizationSettings } from '../../../../apps/web/lib/organization-settings.types';
import { getClientConfirmEmailTemplate } from '../../../features/team-accounts/src/server/actions/clients/send-email/utils/client-confirm-email-template';
import { generateMagicLinkRecoveryPassword } from '../../../features/team-accounts/src/server/actions/members/update/update-account';
import { getTextColorBasedOnBackground } from '../../../features/team-accounts/src/server/utils/generate-colors';
import { getFullDomainBySubdomain } from '../../../multitenancy/utils/get/get-domain';
import { createToken } from '../../../tokens/src/create-token';
import { TokenRecoveryType } from '../../../tokens/src/domain/token-type';

type Params = UserAttributes & { redirectTo: string };

const senderNameKey = OrganizationSettings.KEYS.sender_name;
const senderEmailKey = OrganizationSettings.KEYS.sender_email;
const logoUrlKey = OrganizationSettings.KEYS.logo_url;
const themeColorKey = OrganizationSettings.KEYS.theme_color;
const langKey = OrganizationSettings.KEYS.language;
const defaultAgencySenderName =
  OrganizationSettings.EXTRA_KEYS.default_sender_name;
const defaultAgencyName = OrganizationSettings.EXTRA_KEYS.default_agency_name;
const senderDomainKey = OrganizationSettings.KEYS.sender_domain;
const defaultSenderEmail = OrganizationSettings.EXTRA_KEYS.default_sender_email;
const defaultSenderDomain =
  OrganizationSettings.EXTRA_KEYS.default_sender_domain;
const defaultSenderLogo = OrganizationSettings.EXTRA_KEYS.default_sender_logo;
const defaultSenderColor = OrganizationSettings.EXTRA_KEYS.default_sender_color;

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

export function useUpdateUser() {
  const client = useSupabase();
  const mutationKey = ['supabase:user'];

  const mutationFn = async (attributes: Params) => {
    const { redirectTo, ...params } = attributes;

    const domain = (typeof window !== 'undefined' 
      ? window.location.origin.replace(/^https?:\/\//, '')
      : '');

    const { data: userData, error: userError} = await client.auth.getUser();

    if (userError) {
      throw userError;
    }

    const email = userData.user?.email;

    if (!email) {
      throw new Error('User email not found');
    }

    const responseUpdateUserCredentials = await client.rpc('update_user_credentials', {
      p_domain: domain,
      p_email: email,
      p_password: params.password ?? '',
    });

    if (responseUpdateUserCredentials.error) {
      throw responseUpdateUserCredentials.error;
    }

    const verifyUserCredentials = await client.rpc('verify_user_credentials', {
      p_domain: domain,
      p_email: email,
      p_password: params.password ?? '',
    });

    if (verifyUserCredentials.error) {
      throw verifyUserCredentials.error;
    }

    if (verifyUserCredentials.data.is_primary) {
      const response = await client.auth.updateUser(params, {
        emailRedirectTo: redirectTo,
      });
      if (response.error) {
        throw response.error;
      }
    } 

    if(params.email && email !== params.email) {
      // step 1: Generate a token from suuper and save it in the database
      const generatedMagicLink = await generateMagicLinkRecoveryPassword(
        email,
        undefined,
        true,
      );
      const tokenRecoveryTypeActualEmail: TokenRecoveryType = {
        email,
        redirectTo: generatedMagicLink,
        user_id: userData.user?.id,
        domain: domain,
      };
      const { tokenId } = await createToken(tokenRecoveryTypeActualEmail);
      const url = new URL(redirectTo);
      const baseUrl = url.origin;
      
      // step 2: Send an email with the token to the user
      const updateEmailUrl = `${baseUrl}/auth/confirm?token_hash_recovery=${tokenId}&email=${params.email}&type=update_email&next=${baseUrl}/orders`;
      let lang: 'en' | 'es' = 'en';
      const { settings } = await getFullDomainBySubdomain(url.host, true, [
        logoUrlKey,
        themeColorKey,
        senderNameKey,
        senderDomainKey,
        senderEmailKey,
        langKey,
      ]);

      let senderName = '',
        logoUrl = '',
        themeColor = '',
        senderDomain = defaultSenderDomain,
        senderEmail = defaultSenderEmail;

      settings.forEach((setting) => {
        if (setting.key === logoUrlKey && !logoUrl) {
          logoUrl = setting.value;
        }
        if (setting.key === themeColorKey && !themeColor) {
          themeColor = setting.value;
        }
        if (setting.key === senderNameKey && !senderName) {
          senderName = setting.value;
        }
        if (setting.key === senderDomainKey) {
          senderDomain = setting.value;
        }
        if (setting.key === senderEmailKey) {
          senderEmail = setting.value;
        }
        if (setting.key === langKey) {
          lang = setting.value as 'en' | 'es';
        }
      });

      logoUrl = logoUrl ?? defaultSenderLogo;
      themeColor = themeColor ?? defaultSenderColor;

      const { template, t } = getClientConfirmEmailTemplate(
        email,
        baseUrl,
        tokenId,
        updateEmailUrl,
        lang,
        defaultAgencyName,
        logoUrl,
        themeColor,
        getTextColorBasedOnBackground(themeColor),
        'update_email',
      );

      const fromSenderIdentity = senderName
        ? `${senderName} <${senderEmail}@${senderDomain}>`
        : `${defaultAgencySenderName} ${t('at')} ${defaultAgencyName} <${senderEmail}@${senderDomain}>`;

      const res = await fetch(`${baseUrl}/api/v1/mailer`, {
        method: 'POST',
        headers: new Headers({
          Authorization: `Basic ${btoa(`${SUUPER_CLIENT_ID}:${SUUPER_CLIENT_SECRET}`)}`,
        }),
        body: JSON.stringify({
          from: fromSenderIdentity,
          to: [params.email, email],
          subject: t('subject'),
          html: template,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send email confirmation');
      }
    }

    return verifyUserCredentials.data;

  };

  return useMutation({
    mutationKey,
    mutationFn,
  });
}
