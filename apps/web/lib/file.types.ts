import { Database } from './database.types';

export namespace File {
  export type Type = Database['public']['Tables']['files']['Row'];
  export type Insert = Database['public']['Tables']['files']['Insert'];
  export type Update = Database['public']['Tables']['files']['Update'];
}
