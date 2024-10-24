import { Database } from './database.types';


export namespace Subtask {
  export type Type = Database['public']['Tables']['subtasks']['Row'] ;
  export type Insert = Database['public']['Tables']['subtasks']['Insert'];
  export type Update = Database['public']['Tables']['subtasks']['Update'];
}

export namespace Task {
  export type Type = Database['public']['Tables']['tasks']['Row'] & {
    subtasks?: Subtask.Type[];
  };
  export type Insert = Database['public']['Tables']['tasks']['Insert'] & {
    subtasks?: Subtask.Insert[];
  };
  export type Update = Database['public']['Tables']['tasks']['Update'] & {
    subtasks?: Subtask.Update[];
  };
}

