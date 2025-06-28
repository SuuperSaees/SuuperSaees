import { Database } from './database.types';
import { Service } from './services.types';

export namespace Checkout {
  export type Type = Database['public']['Tables']['checkouts']['Row'];
  export type Insert = Database['public']['Tables']['checkouts']['Insert'];
  export type Update = Database['public']['Tables']['checkouts']['Update'];

  export namespace Request {
    export type Create = Checkout.Insert & {
      service_id?: number | null;
    };
    export type Update = Checkout.Update & {
      service_id?: number | null;
    };
  }

  export type Response = Checkout.Type & {
    checkout_services?: CheckoutService.Response[] | null;
  };
}

export namespace CheckoutService {
  export type Type = Database['public']['Tables']['checkout_services']['Row'];
  export type Insert = Database['public']['Tables']['checkout_services']['Insert'];
  export type Update = Database['public']['Tables']['checkout_services']['Update'];

  export type Response = CheckoutService.Type & {
    service?: Service.Response | null;
  };

  export namespace Request {
    export type Create = CheckoutService.Insert
    export type Update = CheckoutService.Update
  }
}