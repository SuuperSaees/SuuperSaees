import { Database } from './database.types';

export namespace Client {
  export type Type = Database['public']['Tables']['clients']['Row'];
  export type Insert = Database['public']['Tables']['clients']['Insert'];
  export type Update = Database['public']['Tables']['clients']['Update'];
}
