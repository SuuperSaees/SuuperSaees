import { Database } from './database.types';
import { File } from './file.types';
import { User } from './user.types';

export namespace Message {
  export type Type = Database['public']['Tables']['messages']['Row'] & {
    user?: User.Response;
    files?: File.Type[];
  };
  export type Insert = Database['public']['Tables']['messages']['Insert'];
  export type Update = Database['public']['Tables']['messages']['Update'];
}