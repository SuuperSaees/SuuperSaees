import { Database } from './database.types';

export namespace UserSettings {
  export type Type = Database['public']['Tables']['user_settings']['Row'];
  export type Insert = Database['public']['Tables']['user_settings']['Insert'];
  export type Update = Database['public']['Tables']['user_settings']['Update'];

  export type Response = Pick<Type, 'name' | 'picture_url'> & Partial<Type>;
}