import { Database } from './database.types';

export namespace Folder {
  export type Type = Database['public']['Tables']['folders']['Row'];
  export type Insert = Database['public']['Tables']['folders']['Insert'];
  export type Update = Database['public']['Tables']['folders']['Update'];
}