import { Database } from './database.types';

export namespace Chats {
  export type Type = Database['public']['Tables']['chats']['Row']
  export type Insert = Database['public']['Tables']['chats']['Insert'];
  export type Update = Database['public']['Tables']['chats']['Update'];
}
