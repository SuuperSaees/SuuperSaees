import { Database } from './database.types';


export namespace Subtask {
  export type Type = Database['public']['Tables']['subtasks']['Row'] & {
    followers: Database['public']['Tables']['subtask_followers']['Row'][]; 
  } & {
    assigned_to: Database['public']['Tables']['subtask_assignations']['Row'][];
  }
  export type Insert = Database['public']['Tables']['subtasks']['Insert'] & {
    followers?: Database['public']['Tables']['subtask_followers']['Insert'][]; 
  } & {
    assigned_to?: Database['public']['Tables']['subtask_assignations']['Insert'][];
  }
  export type Update = Database['public']['Tables']['subtasks']['Update'] & {
    followers?: Database['public']['Tables']['subtask_followers']['Update'][]; 
  } & {
    assigned_to?: Database['public']['Tables']['subtask_assignations']['Update'][];
  }
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

