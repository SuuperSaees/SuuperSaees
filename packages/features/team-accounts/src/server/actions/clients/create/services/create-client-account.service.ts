import { Account } from '../../../../../../../../../apps/web/lib/account.types';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { OrganizationSettings as OrganizationSettingsType } from '../../../../../../../../../apps/web/lib/organization-settings.types';
import { generateRandomPassword, getTextColorBasedOnBackground} from '../../../../utils/generate-colors';
import { getDomainByUserId, getDomainByOrganizationId } from '../../../../../../../../multitenancy/utils/get/get-domain';
import { fetchCurrentUser } from '../../../members/get/get-member-account';
import { decodeToken } from '../../../../../../../../tokens/src/decode-token';
import { sendClientConfirmEmail } from '../../send-email/send-client-email';
import { CustomError } from '@kit/shared/response';
import { ErrorUserOperations } from '@kit/shared/response';
import { getOrganizationSettings, getOrganizationSettingsByOrganizationId } from '../../../organizations/get/get-organizations';
import { Tokens } from '../../../../../../../../../apps/web/lib/tokens.types';

export const createClientUserAccount = async (
    clientEmail: string,
    clientName: string,
    organizationName: Account.Type['name'],
    adminActivated = false,
    agencyId?: string,
    sendEmail = true,
  ) => {
    try {
      const client = getSupabaseServerComponentClient({
        admin: adminActivated,
      });
      let baseUrl, organizationId;
      if (!adminActivated) {
        const userData = await fetchCurrentUser(client);
        const userId = userData?.id;
        if (!userId) throw new Error('No user id provided');
        const { domain: baseUrlValue, organizationId: organizationIdValue } =
          await getDomainByUserId(userId, true);
        baseUrl = baseUrlValue;
        organizationId = organizationIdValue;
      } else {
        baseUrl = await getDomainByOrganizationId(agencyId ?? '', true, true);
        organizationId = agencyId ?? '';
      }
  
      // Step 1: Pre-authentication of the user
      const password = generateRandomPassword(12);

      const { logo_url, theme_color } = OrganizationSettingsType.KEYS;
  
      const { default_sender_logo, default_sender_color } =
        OrganizationSettingsType.EXTRA_KEYS;
      let organizationLogo: {
          key: string;
          value: string;
        } | null = null,
        organizationColor: {
          key: string;
          value: string;
        } | null = null;
  
      if (!adminActivated) {
        const organizationSettings = await getOrganizationSettings();
  
        organizationSettings.forEach((setting) => {
          if (setting.key === logo_url && setting.value !== '')
            organizationLogo = { key: logo_url, value: setting.value };
          if (setting.key === theme_color && setting.value !== '')
            organizationColor = { key: theme_color, value: setting.value };
        });
      } else {
        const organizationSettings =
          await getOrganizationSettingsByOrganizationId(
            organizationId ?? '',
            adminActivated,
            [logo_url, theme_color],
          );
  
        organizationSettings.forEach((setting) => {
          if (setting.key === logo_url && setting.value !== '')
            organizationLogo = { key: logo_url, value: setting.value };
          if (setting.key === theme_color && setting.value !== '')
            organizationColor = { key: theme_color, value: setting.value };
        });
      }
  
      organizationLogo = organizationLogo ?? {
        key: logo_url,
        value: default_sender_logo,
      };
  
      organizationColor = organizationColor ?? {
        key: theme_color,
        value: default_sender_color,
      };
  
      // Step 2: Sign up the user
      const { data: clientOrganizationUser, error: clientOrganizationUserError } =
        await client.auth.signUp({
          email: clientEmail ?? '',
          password,
        });
  
      if (clientOrganizationUserError) {
        console.error(
          'Error occurred while creating the client user. Authentication error',
        );
        throw new CustomError(
          401,
          'Authentication error',
          ErrorUserOperations.USER_ALREADY_EXISTS,
        );
      }
      // Step 3: Take the object session and decode the access_token as jwt to get the session id
      const sessionUserClient = clientOrganizationUser.session;
      const createdAtAndUpdatedAt = new Date().toISOString();
      const accessToken = sessionUserClient?.access_token ?? '';
      const refreshToken = sessionUserClient?.refresh_token ?? '';
      const expiresAt = new Date(
        new Date().getTime() + 3600 * 1000,
      ).toISOString();
      const providerToken = 'supabase';
      const sessionId = decodeToken(accessToken, 'base64')?.session_id as string;
      const callbackUrl = `${baseUrl}set-password`;
      // Step 4: Save the token in the database
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
      // Step 5: Send the email with the magic link
      if (sendEmail) {
      await sendClientConfirmEmail(
        baseUrl,
        clientEmail,
        organizationLogo.value,
        organizationColor.value,
        getTextColorBasedOnBackground(organizationColor.value),
        sessionId,
        callbackUrl,
        organizationName,
        organizationId ?? '',
        ).catch((error) => {
          console.error('Error occurred while sending the email', error);
        });
      } else {
        return {
          ...clientOrganizationUser,
          session: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt,
            provider: providerToken,
          }
        };
      }

      if(clientName) {
          // Update the accounts name
        const {  error: updateError } = await client
          .from('accounts')
          .update({
            name: clientName,
            updated_at: createdAtAndUpdatedAt,
          })
          .eq('id', clientOrganizationUser.user?.id ?? '')
          .select()
          .single();

        if (updateError) {
          console.error('Error occurred while updating the client user name', updateError);
        }
      }
      // Step 6: Return the client organization user
      return clientOrganizationUser;
    } catch (error) {
      console.error('Error occurred while creating the client user');
      throw error;
    }
  };