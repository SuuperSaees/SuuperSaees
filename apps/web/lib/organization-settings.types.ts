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
    // If you want to add more keys, make sure they are defined in the 'organization_setting_key' enum in 'database.types.ts'
  };

  export const EXTRA_KEYS = {
    default_sender_name: 'Ana',
    default_agency_name: 'Suuper',
  };
}