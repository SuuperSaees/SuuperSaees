import { Database } from './database.types';


export namespace OrganizationSettings {
  export type Type =
    Database['public']['Tables']['organization_settings']['Row'];
  // Infer the keys from the enum
  export type KeysEnum =
    Database['public']['Enums']['organization_setting_key'];

  // Create a type that maps the enum keys to themselves
  export type Keys<T extends KeysEnum> = {
    [key in T]: key;
  };

  export const KEYS: Keys<KeysEnum> = {
    theme_color: 'theme_color',
    background_color: 'background_color',
    logo_url: 'logo_url',
    timezone: 'timezone',
    language: 'language',
    date_format: 'date_format',
    sidebar_background_color: 'sidebar_background_color',
    portal_name: 'portal_name',
    favicon_url: 'favicon_url',
    sender_name: 'sender_name',
    sender_email: 'sender_email',
    sender_domain: 'sender_domain',
    logo_dark_url: 'logo_dark_url',
    auth_card_background_color: 'auth_card_background_color',
    auth_section_background_color: 'auth_section_background_color',
    dashboard_url: 'dashboard_url',
    catalog_provider_url: 'catalog_provider_url',
    catalog_product_url: 'catalog_product_url',
    tool_copy_list_url: 'tool_copy_list_url',
    pinned_organizations: 'pinned_organizations',
    auth_background_url: 'auth_background_url',
    parteners_url: 'parteners_url',
    catalog_product_wholesale_url: 'catalog_product_wholesale_url',
    catalog_product_private_label_url: 'catalog_product_private_label_url',
    training_url: 'training_url',
    catalog_sourcing_china_url: 'catalog_sourcing_china_url',
    calendar_url: 'calendar_url',
    notification_sound: 'notification_sound',
    payment_details: 'payment_details',
    // If you want to add more keys, make sure they are defined in the 'organization_setting_key' enum in 'database.types.ts'
  };

  export const EXTRA_KEYS = {
    default_sender_name: 'Ana',
    default_agency_name: 'Suuper',
    default_sender_logo:
      'https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/suuper-logo.png',
    default_sender_color: '#1A38D7',
    default_from_sender_identity: 'Ana de Suuper <samuel@suuper.co>',
    default_sender_email: 'ana',
    default_sender_domain: 'suuper.co',
  };
}