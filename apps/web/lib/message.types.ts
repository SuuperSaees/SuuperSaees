import { Database } from './database.types';

export namespace Message {
  export type Type = Database['public']['Tables']['messages']['Row'];
  export type Insert = Database['public']['Tables']['messages']['Insert'];
  export type Update = Database['public']['Tables']['messages']['Update'];
}
