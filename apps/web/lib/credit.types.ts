import { Database } from './database.types';

export namespace CreditOperations {
  export type Type = Database['public']['Tables']['credit_operations']['Row'];
  export type Insert = Database['public']['Tables']['credit_operations']['Insert'];
  export type Update = Database['public']['Tables']['credit_operations']['Update'];

  export type Response = CreditOperations.Type;

   export namespace Enums {
    export enum Status {
      CONSUMED = 'consumed',
      PURCHASED = 'purchased',
      REFUNDED = 'refunded',
      LOCKED = 'locked',
      EXPIRED = 'expired'
    }

    export enum Type {
      USER = 'user',
      SYSTEM = 'system',
    }
  }
}

export namespace Credit {
  export type Type = Database['public']['Tables']['credits']['Row'];
  export type Insert = Database['public']['Tables']['credits']['Insert'];
  export type Update = Database['public']['Tables']['credits']['Update'];

  export namespace Request {
    export type Create = Omit<Credit.Insert, 'id' | 'created_at' | 'updated_at' | 'deleted_on'> & {
      credit_operations?: CreditOperations.Insert[] | null;
    };
    export type Update = Credit.Update & {
      credit_operations?: (CreditOperations.Update | CreditOperations.Insert)[] | null;
    };
  }

  export type Response = Credit.Type & {
    credit_operations?: CreditOperations.Response[] | null;
  };
  
 
}