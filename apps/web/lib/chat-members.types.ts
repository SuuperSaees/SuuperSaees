import { Database } from "./database.types";

export namespace ChatMembers {
  export type Type = Database['public']['Tables']['chat_members']['Row'];
  export type Insert = Database['public']['Tables']['chat_members']['Insert'];
  export type Update = Database['public']['Tables']['chat_members']['Update'];
}