import { Database } from './database.types'

export namespace Organization {
  export type Type = Database['public']['Tables']['organizations']['Row'];
  export type Insert = Database['public']['Tables']['organizations']['Insert'];
  export type Update = Database['public']['Tables']['organizations']['Update'];
}