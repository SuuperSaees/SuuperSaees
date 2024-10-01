import { Database } from './database.types';


export namespace Service {
  export type Type = Database['public']['Tables']['services']['Row'];
  export type Insert = Database['public']['Tables']['services']['Insert'];
  export type Update = Database['public']['Tables']['services']['Update'];
  export type Response = Pick<
    Service.Type,
    'id' | 'name' | 'price' | 'service_image' | 'service_description'
  >;

  export namespace Relationships {
    export namespace Client {
      export type Response = Service.Response & {
        created_at: Database['public']['Tables']['client_services']['Row']['created_at'];
        subscription_id: Database['public']['Tables']['client_services']['Row']['id'];
      };
    }
  }
}