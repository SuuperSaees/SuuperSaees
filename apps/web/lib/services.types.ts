import { Database } from './database.types';


export namespace Service {
  export type Type = Database['public']['Tables']['services']['Row'];
  export type Insert = Database['public']['Tables']['services']['Insert'];
  export type Update = Database['public']['Tables']['services']['Update'];
  export type Response = Pick<
    Service.Type,
    'id' | 'name' | 'price' | 'service_image' | 'service_description'
  >;

  export type ServiceData = {
    id: number;
    step_type_of_service: {
      single_sale: boolean;
      recurring_subscription: boolean;
    };
    step_service_details: {
      service_image: string;
      service_name: string;
      service_description: string;
    };
    step_service_price: {
      standard: boolean;
      purchase_limit: number;
      allowed_orders: number;
      time_based: boolean;
      hours: number;
      credit_based: boolean;
      credits: number;
      price: number;
      recurrence: string;
      test_period: boolean;
      test_period_duration: number;
      test_period_duration_unit_of_measurement: string;
      test_period_price: number;
      max_number_of_simultaneous_orders: number;
      max_number_of_monthly_orders: number;
    };
    step_connect_briefs: {
      id: string;
      name: string;
    }[];
  };

  export namespace Relationships {
    export namespace Client {
      export type Response = Service.Response & {
        created_at: Database['public']['Tables']['client_services']['Row']['created_at'];
        subscription_id: Database['public']['Tables']['client_services']['Row']['id'];
      };
    }
    export namespace Billing {
      export type BillingService = Service.Type & {
        billing_services: {
          provider_id: Database['public']['Tables']['billing_services']['Row']['provider_id'];
          provider: Database['public']['Tables']['billing_services']['Row']['provider'];
        }[];
      };
    }
  }
}