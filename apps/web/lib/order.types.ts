import { Activity } from './activity.types';
import { Database } from './database.types';
import { File } from './file.types';
import { Task } from './tasks.types';
import { Message } from './message.types';
import { Review } from './review.types';
import { User } from './user.types';


export namespace Order {
  export type Type = Database['public']['Tables']['orders_v2']['Row'] & {
    client?: Database['public']['Tables']['clients']['Update'] | null;
    user?: User.Type;
    messages?: Message.Type[];
    files?: File.Type[];
    tasks?: Task.Type[];
    assigned_to?: { agency_member: User.Type }[];
    followers?: { client_follower: User.Type }[];
  };
  export type Relational = Order.Relationships.All & {
    messages: (Message.Type & { user: User.Response; files: File.Type[] })[];
    files: (File.Type & { user: User.Response })[];
    tasks: Task.Type[];
    activities: (Activity.Type & { user: User.Response })[];
    reviews: (Review.Type & { user: User.Response })[];
    client: User.Response;
    assigned_to: {
      agency_member: User.Response;
    }[];
    followers: {
      client_follower: User.Response;
    }[];
    client_organization: {
      name: string;
      slug: string;
    };
  };
  export type Insert = Database['public']['Tables']['orders_v2']['Insert'];
  export type Update = Database['public']['Tables']['orders_v2']['Update'];
  export namespace Relationships {
    export type Messages = Order.Type & {
      messages: Message.Type[];
    };
    export type Files = Order.Type & {
      files: File.Type[];
    };
    export type Tasks = Order.Type & {
      tasks: Task.Type[];
    };
    export type Client = Order.Type & {
      client: Database['public']['Tables']['clients']['Update'] | null;
    };
    export type User = Order.Type & {
      user: User;
    };
    export type Reviews = Order.Type & {
      reviews: Review.Type[];
    };
    export type Activities = Order.Type & {
      activities: Activity.Type[];
    };
    export type All = Order.Type & {
      messages: Message.Type[];
      files: File.Type[];
      client: Database['public']['Tables']['clients']['Update'] | null;
      tasks: Task.Type[];
      user: User;
      reviews: Review.Type[];
      activities: Activity.Type[];
    };
  }
  export namespace Enums {
    export enum Status {
      PENDING = 'pending',
      IN_PROGRESS = 'in_progress',
      IN_REVIEW = 'in_review',
      COMPLETED = 'completed',
      ANNULLED = 'annulled',
    }

    export enum Priority {
      LOW = 'low',
      MEDIUM = 'medium',
      HIGH = 'high',
    }
  }
}