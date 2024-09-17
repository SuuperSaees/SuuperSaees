import { Database } from './database.types';

export namespace Subscription {
  export type Type = Database['public']['Tables']['subscriptions']['Row']
  export type Insert = Database['public']['Tables']['subscriptions']['Insert'];
  export type Update = Database['public']['Tables']['subscriptions']['Update'];
}