import { getTextColorBasedOnBackground } from '../../../../../../../../apps/web/app/utils/generate-colors';
import { OrganizationSettings } from '../../../../../../../../apps/web/lib/organization-settings.types';
import { getOrganizationSettingsByOrganizationId } from '../../organizations/get/get-organizations';


// const emailSender = process.env.EMAIL_SENDER ?? '';
const senderNameKey = OrganizationSettings.KEYS.sender_name;
const senderEmailKey = OrganizationSettings.KEYS.sender_email;
const logoUrlKey = OrganizationSettings.KEYS.logo_url;
const themeColorKey = OrganizationSettings.KEYS.theme_color;
const defaultAgencySenderName =
  OrganizationSettings.EXTRA_KEYS.default_sender_name;
const defaultAgencyName = OrganizationSettings.EXTRA_KEYS.default_agency_name;
const senderDomainKey = OrganizationSettings.KEYS.sender_domain;
const defaultSenderEmail = OrganizationSettings.EXTRA_KEYS.default_sender_email;
const defaultSenderDomain = OrganizationSettings.EXTRA_KEYS.default_sender_domain;

export async function getFormSendIdentity(organizationId: string, at: string) {
  const organizationSettings = await getOrganizationSettingsByOrganizationId(
    organizationId,
    true,
    [senderNameKey, logoUrlKey, themeColorKey, senderDomainKey, senderEmailKey],
  );
  let senderName = '',
    logoUrl = '',
    themeColor = '',
    senderDomain = defaultSenderDomain,
    senderEmail = defaultSenderEmail;

  organizationSettings.forEach((setting) => {
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
  });

  const fromSenderIdentity = senderName
    ? `${senderName} <${senderEmail}@${senderDomain}>`
    : `${defaultAgencySenderName} ${at} ${defaultAgencyName} <${defaultSenderEmail}@${defaultSenderDomain}>`;

  themeColor = themeColor ?? '#1A38D7';
  logoUrl =
    logoUrl ??
    'https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/suuper-logo.png';

  const buttonTextColor =
    getTextColorBasedOnBackground(themeColor) ?? '#ffffff';

  return { fromSenderIdentity, logoUrl, themeColor, buttonTextColor };
}