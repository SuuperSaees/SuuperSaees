import { OrganizationSettings } from '../../../../../../../../apps/web/lib/organization-settings.types';
import { getOrganizationSettingsByOrganizationId } from '../../organizations/get/get-organizations';

const emailSender = process.env.EMAIL_SENDER ?? '';
const senderNameKey = OrganizationSettings.KEYS.sender_name;
const defaultAgencySenderName =
  OrganizationSettings.EXTRA_KEYS.default_sender_name;
const defaultAgencyName = OrganizationSettings.EXTRA_KEYS.default_agency_name;

export async function getFormSendIdentity(
  agencyName: string,
  organizationId: string,
  at: string,
) {
  const organizationSettings = await getOrganizationSettingsByOrganizationId(
    organizationId,
    true,
    [senderNameKey],
  );
  const senderName =
    organizationSettings.find((setting) => setting.key === senderNameKey)
      ?.value ?? ''; // Important: Keep the default as an empty string to handle conditional logic later

  const fromSenderIdentity = senderName
    ? `${senderName} <${emailSender}>`
    : `${defaultAgencySenderName} ${at} ${defaultAgencyName} <${emailSender}>`;

  return fromSenderIdentity;
}
