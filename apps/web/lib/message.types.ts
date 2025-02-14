import { Database } from './database.types';
import { File } from './file.types';
import { User } from './user.types';

export namespace Message {
  export type Type = Database['public']['Tables']['messages']['Row'] & {
    user?: User.Response;
    files?: File.Response[];
  };
  export type Insert = Database['public']['Tables']['messages']['Insert'];
  export type Update = Database['public']['Tables']['messages']['Update'];
  export type TypeOnly = Database['public']['Tables']['messages']['Row'];

  export enum Category {
    CHAT_MESSAGE = 'chat_message',
    ANNOTATION = 'annotation',
  }
  export enum Visibility {
    PUBLIC = 'public',
    INTERNAL_AGENCY = 'internal_agency',
  }
}
