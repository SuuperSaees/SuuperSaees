import { Database } from './database.types';

export namespace Session {
  export type Type = Database['public']['Tables']['sessions']['Row'];
  export type Insert = Database['public']['Tables']['sessions']['Insert'];
  export type Update = Database['public']['Tables']['sessions']['Update'];
}
