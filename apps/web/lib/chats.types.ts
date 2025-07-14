import { Database } from './database.types';
import { ChatMembers } from './chat-members.types';
import { ChatMessages } from './chat-messages.types';
import { Message } from './message.types';
import { Members } from './members.types';
import { Organization } from './organization.types';

export namespace Chats {
  export type Type = Database['public']['Tables']['chats']['Row']
  export type Insert = Database['public']['Tables']['chats']['Insert'];
  export type Update = Database['public']['Tables']['chats']['Update'];
  export type TypeWithRelations = Type & {
    chat_members?: ChatMembers.Type[];
    members?: (ChatMembers.Type & { user: { organization_id: Organization.Type['id'] } })[];
    messages?: Message.Type[] | null;
    chat_messages?: ChatMessages.TypeWithRelations[];
    organizations?: Members.Organization[];
  };
  export type InsertWithRelations = Insert & {
    chat_members: ChatMembers.Insert[];
  };
  export type FetchLatest = {
    scope: 'client' | 'agency';
    clientOrganizationId?: string;
    agencyId?: string;
  }
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