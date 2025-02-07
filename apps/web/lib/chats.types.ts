import { Database } from './database.types';
import { ChatMembers } from './chat-members.types';
import { ChatMessages } from './chat-messages.types';
import { Message } from './message.types';

export namespace Chats {
  export type Type = Database['public']['Tables']['chats']['Row']
  export type Insert = Database['public']['Tables']['chats']['Insert'];
  export type Update = Database['public']['Tables']['chats']['Update'];
  export type TypeWithRelations = Type & {
    chat_members?: ChatMembers.Type[];
    messages?: Message.Type[];
    chat_messages?: ChatMessages.TypeWithRelations[];
  };
  export type InsertWithRelations = Insert & {
    chat_members: ChatMembers.Insert[];
  };
}



export enum TableName {
  CHATS = 'chats',
  CHAT_MEMBERS = 'chat_members',
  CHAT_MESSAGES = 'chat_messages',
}

export type SubscriptionPayload =
  | Chats.Type
  | ChatMembers.Type
  | ChatMessages.Type;