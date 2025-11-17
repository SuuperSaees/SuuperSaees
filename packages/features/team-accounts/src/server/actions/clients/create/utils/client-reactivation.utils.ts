import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../../../../../../../apps/web/lib/database.types';
import { CustomError } from '../../../../../../../../../packages/shared/src/response';
import { ErrorOrganizationOperations } from '../../../../../../../../../packages/shared/src/response';
import { insertOrganization } from '../../../organizations/create/create-organization-server';
import { generateMagicLinkRecoveryPassword } from '../../../members/update/update-account';
import { TokenRecoveryType } from '../../../../../../../../tokens/src/domain/token-type';
import { createToken } from '../../../../../../../../tokens/src/create-token';
import { getFullDomainBySubdomain } from '../../../../../../../../multitenancy/utils/get/get-domain';
import { getClientConfirmEmailTemplate } from '../../send-email/utils/client-confirm-email-template';
import { HttpStatus } from '../../../../../../../../shared/src/response/http-status';
import { ErrorUserOperations } from '../../../../../../../../shared/src/response';
import { getTextColorBasedOnBackground, generateRandomPassword } from '../../../../utils/generate-colors';
import {
  senderNameKey,
  senderEmailKey,
  logoUrlKey,
  themeColorKey,
  langKey,
  defaultAgencySenderName,
  defaultAgencyName,
  senderDomainKey,
  defaultSenderEmail,
  defaultSenderDomain,
  defaultSenderLogo,
  defaultSenderColor,
} from '../create-client.types';
import { getSuuperClientId, getSuuperClientSecret } from './client-account.utils';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Organization } from '../../../../../../../../../apps/web/lib/organization.types';

interface ReactivateClientParams {
  accountId: string;
  email: string;
  name: string;
  slug: string;
  baseUrl?: string;
  supabase?: SupabaseClient<Database>;
  adminActivated?: boolean;
  clientOrganizationId?: string;
  agencyId?: string;
  newAgency?: boolean;
}

export const reactivateDeletedClient = async ({
  accountId,
  email,
  name,
  slug,
  baseUrl,
  supabase,
  adminActivated = false,
  clientOrganizationId,
  agencyId,
  newAgency = false,
}: ReactivateClientParams) => {
  supabase = supabase ?? getSupabaseServerComponentClient({ admin: adminActivated });
  // Create the new organization for this client
  let clientOrganizationAccount: Organization.Type | null = null;
  let clientOrganizationAccountId = clientOrganizationId;
  if (!clientOrganizationId) {
  clientOrganizationAccount = await insertOrganization(
    { name: slug },
    accountId,
    supabase,
    adminActivated,
  );
  clientOrganizationAccountId = clientOrganizationAccount?.id ?? '';
}

  if (!clientOrganizationAccount && !clientOrganizationAccountId) {
    throw new CustomError(
      404,
      'No organization found for this client',
      ErrorOrganizationOperations.ORGANIZATION_NOT_FOUND,
    );
  }

  // Reactivate the client by setting deleted_on to null
  const { error: reactivateError } = await supabase
    .from('clients')
    .upsert({
      deleted_on: null,
      organization_client_id: clientOrganizationAccountId ?? '',
      user_client_id: accountId,
      agency_id: agencyId ?? '',
    }, {
      onConflict: 'user_client_id, agency_id, organization_client_id',
    })

  if (reactivateError) {
    throw new Error(`Error reactivating client: ${reactivateError.message}`);
  }

  // Delete the user settings row for this user
  // const { error: deleteUserSettingsError } = await supabase
  //   .from('user_settings')
  //   .delete()
  //   .eq('user_id', accountId);

  // if (deleteUserSettingsError && deleteUserSettingsError.code !== 'PGRST116') {
  //   throw new Error(`Error deleting user settings: ${deleteUserSettingsError.message}`);
  // }

  // Update the account name and organization
  const updateData: { name?: string } = {};

  if (name && name.trim() !== '') {
    updateData.name = name;
  }

  const { error: updateAccountError } = await supabase
    .from('accounts')
    .update(updateData)
    .eq('id', accountId);

  if (updateAccountError) {
    throw new Error(`Error updating account name: ${updateAccountError.message}`);
  }

  // Update the account membership
  const { error: updateAccountMembershipError } = await supabase
    .from('accounts_memberships')
    .upsert({
      organization_id: clientOrganizationAccountId ?? '',
      user_id: accountId,
      account_role: 'client_owner',
    }, {
      onConflict: 'user_id, organization_id',
    });

  if (updateAccountMembershipError && updateAccountMembershipError.code !== 'PGRST116') {
    throw new Error(`Error updating account membership: ${updateAccountMembershipError.message}`);
  }

  await supabase.rpc('create_user_credentials', {
    p_domain: baseUrl?.replace('http://', '').replace('https://', '') ?? '',
    p_email: email,
    p_password: generateRandomPassword(12),
  });

  await sendReactivationEmail({ email, baseUrl, supabase, newAgency });
};

interface SendReactivationEmailParams {
  email: string;
  baseUrl?: string;
  supabase: SupabaseClient<Database>;
  newAgency?: boolean;
}

async function sendReactivationEmail({ email, baseUrl, supabase, newAgency = false }: SendReactivationEmailParams) {
  const generatedMagicLink = await generateMagicLinkRecoveryPassword(email, supabase, true);
  const tokenRecoveryType: TokenRecoveryType = {
    email: email,
    redirectTo: generatedMagicLink,
  };
  const { tokenId } = await createToken(tokenRecoveryType);

  const resetPasswordUrl = `${baseUrl}/auth/confirm?token_hash_recovery=${tokenId}&email=${email}&type=recovery&next=${baseUrl}/set-password`;
  let lang: 'en' | 'es' = 'en';

  const { settings } = await getFullDomainBySubdomain(
    baseUrl?.replace('http://', '').replace('https://', '') ?? '',
    true,
    [logoUrlKey, themeColorKey, senderNameKey, senderDomainKey, senderEmailKey, langKey],
  );

  let senderName = '',
    logoUrl = '',
    themeColor = '',
    senderDomain = defaultSenderDomain,
    senderEmail = defaultSenderEmail;

  settings.forEach((setting) => {
    if (setting.key === logoUrlKey && !logoUrl) logoUrl = setting.value;
    if (setting.key === themeColorKey && !themeColor) themeColor = setting.value;
    if (setting.key === senderNameKey && !senderName) senderName = setting.value;
    if (setting.key === senderDomainKey) senderDomain = setting.value;
    if (setting.key === senderEmailKey) senderEmail = setting.value;
    if (setting.key === langKey) lang = setting.value as 'en' | 'es';
  });

  logoUrl = logoUrl ?? defaultSenderLogo;
  themeColor = themeColor ?? defaultSenderColor;

  const { template, t } = getClientConfirmEmailTemplate(
    email,
    baseUrl ?? '',
    tokenId,
    resetPasswordUrl,
    lang,
    defaultAgencyName,
    logoUrl,
    themeColor,
    getTextColorBasedOnBackground(themeColor),
    newAgency ? 'reactivation' : 'confirm',
  );

  const fromSenderIdentity = senderName
    ? `${senderName} <${senderEmail}@${senderDomain}>`
    : `${defaultAgencySenderName} ${t('at')} ${defaultAgencyName} <${senderEmail}@${senderDomain}>`;

  const onlyBaseUrl = baseUrl?.includes('localhost') && baseUrl?.includes('https') ? baseUrl.replace('https', 'http') : baseUrl;

  const res = await fetch(`${onlyBaseUrl}/api/v1/mailer`, {
    method: 'POST',
    headers: new Headers({
      Authorization: `Basic ${btoa(`${getSuuperClientId()}:${getSuuperClientSecret()}`)}`,
    }),
    body: JSON.stringify({
      from: fromSenderIdentity,
      to: [email],
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
}