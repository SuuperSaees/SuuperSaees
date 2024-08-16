import { Database } from './database.types';


export namespace Order {
  export type Type = Database['public']['Tables']['orders_v2']['Row'] & {
    client?: Database['public']['Tables']['clients']['Update'] | null;
  };
  export type Insert = Database['public']['Tables']['orders_v2']['Insert'];
  export type Update = Database['public']['Tables']['orders_v2']['Update'];
  export namespace Relationships {
    export type File = Database['public']['Tables']['files']['Insert'];
  }
}