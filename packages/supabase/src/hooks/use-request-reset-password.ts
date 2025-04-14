import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';



import { OrganizationSettings } from '../../../../apps/web/lib/organization-settings.types';
import { getClientConfirmEmailTemplate } from '../../../features/team-accounts/src/server/actions/clients/send-email/utils/client-confirm-email-template';
import { getUserAccountByEmail } from '../../../features/team-accounts/src/server/actions/members/get/get-member-account';
import { generateMagicLinkRecoveryPassword } from '../../../features/team-accounts/src/server/actions/members/update/update-account';
import { getTextColorBasedOnBackground } from '../../../features/team-accounts/src/server/utils/generate-colors';
import { getFullDomainBySubdomain } from '../../../multitenancy/utils/get/get-domain';
import { CustomError, CustomSuccess, ErrorUserOperations } from '../../../shared/src/response';
import { HttpStatus, statusCodeMap } from '../../../shared/src/response/http-status';
import { createToken } from '../../../tokens/src/create-token';
import { TokenRecoveryType } from '../../../tokens/src/domain/token-type';


interface Params {
  email: string;
  redirectTo: string;
}

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

/**
 * @name useRequestResetPassword
 * @description Requests a password reset for a user. This function will
 * trigger a password reset email to be sent to the user's email address.
 * After the user clicks the link in the email, they will be redirected to
 * /password-reset where their password can be updated.
 */
export function useRequestResetPassword() {
  const mutationKey = ['auth', 'reset-password'];

  const mutationFn = async (params: Params) => {
    // step 1: validate if the email is in the database
    const userData = await getUserAccountByEmail(
      params.email,
      undefined,
      true,
    ).catch(() => {
      console.error('Error getting user data');
    });

    if (!userData) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `user Not Found`,
        ErrorUserOperations.USER_NOT_FOUND,
      );
    }

    // step 2: Generate a token from suuper and save it in the database
    const generatedMagicLink = await generateMagicLinkRecoveryPassword(
      userData.email ?? '',
      undefined,
      true,
    );
    const tokenRecoveryType: TokenRecoveryType = {
      email: params.email,
      redirectTo: generatedMagicLink,
    };
    const { tokenId } = await createToken(tokenRecoveryType);
    const url = new URL(params.redirectTo);
    const baseUrl = url.origin;
    // step 3: Send an email with the token to the user
    const resetPasswordUrl = `${baseUrl}/auth/confirm?token_hash_recovery=${tokenId}&email=${params.email}&type=recovery&next=${baseUrl}/set-password`;
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
      params.email,
      baseUrl,
      tokenId,
      resetPasswordUrl,
      lang,
      defaultAgencyName,
      logoUrl,
      themeColor,
      getTextColorBasedOnBackground(themeColor),
      'recovery',
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
        to: [params.email],
        subject: t('subject'),
        html: template,
      }),
    });

    if (!res.ok) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `Failed to send reset password email`,
        ErrorUserOperations.USER_NOT_FOUND,
      );
    }

    return new CustomSuccess(
      200,
      'request-reset-password',
      'Success!',
      statusCodeMap[200],
      '',
    );
  };

  return useMutation({
    mutationFn,
    mutationKey,
  });
}