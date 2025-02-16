import { Database } from './database.types';
import { User } from './user.types';

export namespace File {
  export type Type = Database['public']['Tables']['files']['Row'] & {
    user?: User.Response;
  };
  export type Insert = Database['public']['Tables']['files']['Insert'];
  export type Update = Database['public']['Tables']['files']['Update'];
  export type Response = Pick<Type, 'id' | 'name' | 'type' | 'size' | 'url'> & {
    created_at?: string;
  }
}