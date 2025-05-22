import { Database } from "./database.types";
import { Message } from "./message.types";

export namespace ChatMessages {
  export type Type = Database['public']['Tables']['chat_messages']['Row'];
  export type Insert = Database['public']['Tables']['chat_messages']['Insert'];
  export type Update = Database['public']['Tables']['chat_messages']['Update'];
  export type InsertWithRelations = Database['public']['Tables']['chat_messages']['Insert'] & {
    messages: Database['public']['Tables']['messages']['Insert'][];
  };
  export type TypeWithRelations = Database['public']['Tables']['chat_messages']['Row'] & {
    messages: Database['public']['Tables']['messages']['Row'][];
  };
  export type TypeWithRelationsForChat = Database['public']['Tables']['chat_messages']['Row'] & {
    messages: Message.Type[];
  };

  export interface Configuration {
    pagination?: {
      cursor?: string | number;
      limit?: number;
      endCursor?: string | number;
    };
  }
}
