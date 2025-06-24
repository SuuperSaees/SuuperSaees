import { Database } from './database.types'
import { OrganizationSettings } from './organization-settings.types'
import { User } from './user.types';

export namespace Organization {
  export type Type = Database['public']['Tables']['organizations']['Row'];
  export type Insert = Database['public']['Tables']['organizations']['Insert'];
  export type Update = Database['public']['Tables']['organizations']['Update'];

  export type Response = Pick<Type, 'id' | 'name' | 'slug' | 'picture_url'> 
  & Partial<Type> & {
    settings?: {
      key: OrganizationSettings.KeysEnum;
      value: string;
    }[] | null;
    clients?: {
      organization_client_id: string;
    }[] | null;
    owner?: User.Response | null;
    accounts?: {
      email: string;
      name: string;
      user_settings: {
        name: string;
      }[] | null;
    } | null;
  };
  export type TypeWithRelations = Type & {
    settings: {
      key: OrganizationSettings.KeysEnum;
      value: string;
    }[];
  };
}