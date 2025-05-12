import { Database } from './database.types';
import { UserSettings } from './user-settings.types';

export namespace Account {
  export type Type = Database['public']['Tables']['accounts']['Row'];
  export type Insert = Database['public']['Tables']['accounts']['Insert'];
  export type Update = Database['public']['Tables']['accounts']['Update'];
  export type Response = Pick<
    Account.Type,
    'email' | 'id' | 'name' | 'picture_url'
  > & {
    settings: UserSettings.Type;
  };
  export namespace Relationships {
    export type Membership =
      Database['public']['Tables']['accounts_memberships']['Row'];
  }
}

export type UserWithSettings = {
  id: string;
  name: string;
  email: string;
  user_settings: {
    phone_number: string | null;
    picture_url: string | null;
    calendar: string | null;
  };
};

export const AccountRoles = {
  clientRoles: new Set(['client_member', 'client_owner', 'client_guest']),
  agencyRoles: new Set(['agency_member', 'agency_owner', 'agency_project_manager']),
  allRoles: new Set(['client_member', 'client_owner', 'agency_member', 'agency_owner', 'agency_project_manager', 'client_guest']),
}

export namespace Session {
  export type Type = Database['public']['CompositeTypes']['session_info'];
}

