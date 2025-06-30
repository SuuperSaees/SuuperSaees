import { Database } from './database.types';


export namespace BillingAccounts {
  export type Type = Database['public']['Tables']['billing_accounts']['Row'];
  export type Insert =
    Database['public']['Tables']['billing_accounts']['Insert'];
  export type Update =
    Database['public']['Tables']['billing_accounts']['Update'];
  export type BillingProvider = Database['public']['Enums']['billing_provider'];
  export const BillingProviderKeys = {
    STRIPE: 'stripe',
    LEMON_SQUEEZY: 'lemon-squeezy',
    PADDLE: 'paddle',
    TRELI: 'treli',
    SUUPER: 'suuper',
  } as const satisfies Record<string, BillingProvider>;
  export type PaymentMethod = {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    custom_name?: string;
  };
}