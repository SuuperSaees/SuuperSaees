import { Database } from './database.types';


export namespace Subdomain {
  export type Type = Database['public']['Tables']['subdomains']['Row'];
  export type Insert = Database['public']['Tables']['subdomains']['Insert'];
  export type Update = Database['public']['Tables']['subdomains']['Update'];

  export namespace Api {
    export type Create = {
      domain: string;
      namespace: string;
      service_name: string;
      isCustom?: boolean;
    };
  }
}