import { Database } from './database.types';

export namespace User {
  export type Type = Database['public']['Tables']['accounts']['Row'];
  export type InsertUser = Database['public']['Tables']['accounts']['Insert'];
  export type UpdateUser = Database['public']['Tables']['accounts']['Update'];
}
