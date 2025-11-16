import { OrganizationSettings } from '../../../../../../../../apps/web/lib/organization-settings.types';

export type CreateClient = {
    client: {
      email: string;
      slug: string;
      name: string;
    };
    role: string;
    agencyId?: string;
    adminActivated?: boolean;
    sendEmail?: boolean;
    baseUrl?: string;
    isSignUp?: boolean;
    customPassword?: string;
  };
  
  export const senderNameKey = OrganizationSettings.KEYS.sender_name;
  export const senderEmailKey = OrganizationSettings.KEYS.sender_email;
  export const logoUrlKey = OrganizationSettings.KEYS.logo_url;
  export const themeColorKey = OrganizationSettings.KEYS.theme_color;
  export const langKey = OrganizationSettings.KEYS.language;
  export const defaultAgencySenderName =
    OrganizationSettings.EXTRA_KEYS.default_sender_name;
  export const defaultAgencyName = OrganizationSettings.EXTRA_KEYS.default_agency_name;
  export const senderDomainKey = OrganizationSettings.KEYS.sender_domain;
  export const defaultSenderEmail = OrganizationSettings.EXTRA_KEYS.default_sender_email;
  export const defaultSenderDomain =
    OrganizationSettings.EXTRA_KEYS.default_sender_domain;
  export const defaultSenderLogo = OrganizationSettings.EXTRA_KEYS.default_sender_logo;
  export const defaultSenderColor = OrganizationSettings.EXTRA_KEYS.default_sender_color;
  export const portalNameKey = OrganizationSettings.KEYS.portal_name;