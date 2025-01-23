import { Account } from './account.types';
import { Activity } from './activity.types';
import { AgencyStatus } from './agency-statuses.types';
import { Brief } from './brief.types';
import { Database } from './database.types';
import { File } from './file.types';
import { Message } from './message.types';
import { Review } from './review.types';
import { Task } from './tasks.types';
import { UserSettings } from './user-settings.types';
import { User } from './user.types';
import { Tags } from './tags.types';

type UserResponse = Pick<
  User.Type,
  'email' | 'id' | 'name' | 'picture_url' > & {
    settings:UserSettings.Type;
  }
export namespace Order {
  export type Type = Database['public']['Tables']['orders_v2']['Row'];

  export type Response = Order.Type & {
    tags: {tag:  Tags.Type}[] | null;
    customer: User.Response
    assigned_to: {
      agency_member: UserResponse | null;
    }[] | null;
    client_organization: Account.Response | null;
    followers?: {
      client_follower: User.Response;
    }[] | null;
    brief?: Partial<Pick<Brief.Response, 'name'>>;
    review?: Review.Response;
    statusData?: AgencyStatus.Type | null;
  };
  export type Relational = Order.Relationships.All & {
    brief_responses: Brief.Relationships.FormFieldResponse.Response[]
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
      client_follower: User.Response & {
        role: string;
      };
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

  export type Assignee = Database['public']['Tables']['order_assignations']['Row'];
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
