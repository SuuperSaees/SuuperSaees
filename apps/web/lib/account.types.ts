import { Database } from './database.types';

export namespace Account {
  export type Type = Database['public']['Tables']['accounts']['Row'];
  export type Insert = Database['public']['Tables']['accounts']['Insert'];
  export type Update = Database['public']['Tables']['accounts']['Update'];

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
