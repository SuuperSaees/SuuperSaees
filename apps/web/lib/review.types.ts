import { Database } from './database.types';
import { User } from './user.types';

export namespace Review {
  export type Type = Database['public']['Tables']['reviews']['Row'] & {
    user?: User.Type;
  };
  export type Insert = Database['public']['Tables']['reviews']['Insert'];
  export type Update = Database['public']['Tables']['reviews']['Update'];
}
