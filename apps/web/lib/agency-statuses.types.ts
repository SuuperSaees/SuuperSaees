import { Database } from './database.types';

export namespace AgencyStatus {
  export type Type = Database['public']['Tables']['agency_statuses']['Row'];
  export type Insert = Database['public']['Tables']['agency_statuses']['Insert'];
  export type Update = Database['public']['Tables']['agency_statuses']['Update'];
}