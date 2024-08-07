import { Database } from './database.types';

export namespace Brief {
  export type Type = Database['public']['Tables']['briefs']['Row'] & {
    services?: Database['public']['Tables']['services']['Row'][];
  };
  export type Insert = Database['public']['Tables']['briefs']['Insert'];
  export type Update = Database['public']['Tables']['briefs']['Update'];
}
