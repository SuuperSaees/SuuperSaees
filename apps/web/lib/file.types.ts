import { Database } from './database.types';
import { User } from './user.types';

export namespace File {
  export type Type = Database['public']['Tables']['files']['Row'] & {
    user?: User.Response;
  };
  export type Insert = Database['public']['Tables']['files']['Insert'];
  export type Update = Database['public']['Tables']['files']['Update'];
  export type Response = Pick<
  Type,
  'id' | 'name' | 'type' | 'size' | 'url'
> & Partial<Type>
  export namespace Relationships {
    export namespace FolderFiles {
      export type Insert =
        Database['public']['Tables']['folder_files']['Insert'];
      export type Update =
        Database['public']['Tables']['folder_files']['Update'];
      export type Type = Database['public']['Tables']['folder_files']['Row'];
    }
 
  }
}
