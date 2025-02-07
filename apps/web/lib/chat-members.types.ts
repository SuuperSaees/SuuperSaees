import { Database } from "./database.types";
import { User } from './user.types';

export namespace ChatMembers {
  export type Type = Database['public']['Tables']['chat_members']['Row'];
  export type Insert = Database['public']['Tables']['chat_members']['Insert'];
  export type Update = Database['public']['Tables']['chat_members']['Update'];
  export type TypeWithRelations = Database['public']['Tables']['chat_members']['Row'] & {
    user: User.Response;
  };
  export type ChatRoleType = Database['public']['Enums']['chat_role_type'];
}