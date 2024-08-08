import { Database } from './database.types';

export namespace Service {
  export type Type = Database['public']['Tables']['services']['Row']
  export type Insert = Database['public']['Tables']['services']['Insert'];
  export type Update = Database['public']['Tables']['services']['Update'];
}