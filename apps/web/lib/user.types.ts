import { Database } from './database.types';
import { UserSettings } from './user-settings.types';


export namespace User {
  export type Type = Database['public']['Tables']['accounts']['Row'];
  export type Insert = Database['public']['Tables']['accounts']['Insert'];
  export type Update = Database['public']['Tables']['accounts']['Update'];
  export type Response = Pick<
    Type,
    'email' | 'id' | 'name' | 'picture_url'
  > & {
    settings?: UserSettings.Response[] | null;
    role?: string | null;
  } & Partial<User.Type>;
}