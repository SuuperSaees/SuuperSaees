import { Database } from './database.types';

export namespace Tags {
  export type Type = Database['public']['Tables']['tags']['Row']
  export type Insert = Database['public']['Tables']['tags']['Insert'];
  export type Update = Database['public']['Tables']['tags']['Update'];
}