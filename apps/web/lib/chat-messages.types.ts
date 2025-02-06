import { Database } from "./database.types";

export namespace ChatMessages {
  export type Type = Database['public']['Tables']['chat_messages']['Row'];
  export type Insert = Database['public']['Tables']['chat_messages']['Insert'];
  export type Update = Database['public']['Tables']['chat_messages']['Update'];
}
