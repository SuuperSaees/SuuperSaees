import { Database } from './database.types';
import { User } from './user.types';

export namespace Activity {
  export type Type = Database['public']['Tables']['activities']['Row'];
  export type Insert = Database['public']['Tables']['activities']['Insert'];
  export type Update = Database['public']['Tables']['activities']['Update'];

  export type Response = {
    data: (Activity.Type & {
      user?: User.Response | null;
    })[];
    nextCursor: string | null;
  }
  export type A = Database['public']['Enums']['action_type'];
  export type B = Database['public']['Enums']['activity_type'];

  export namespace Enums {
    // "message" | "review" | "status" | "priority" | "assign" | "due_date" | "description"
    export enum ActivityType {
      MESSAGE = 'message',
      REVIEW = 'review',
      STATUS = 'status',
      PRIORITY = 'priority',
      ASSIGN = 'assign',
      DUE_DATE = 'due_date',
      DESCRIPTION = 'description',
      TITLE = 'title',
      ASSIGNED_TO = 'assigned_to',
      TASK = 'task',
      ANNOTATION = 'annotation',
      INVOICE = 'invoice',
    }
    // "create" | "update" | "delete"

    export enum ActionType {
      CREATE = 'create',
      UPDATE = 'update',
      DELETE = 'delete',
      COMPLETE = 'complete',
    }
  }
}
