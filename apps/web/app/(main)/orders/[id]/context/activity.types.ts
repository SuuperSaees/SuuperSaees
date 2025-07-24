import { UseInfiniteQueryResult, UseMutationResult } from '@tanstack/react-query';

import { JSONCustomResponse } from '@kit/shared/response';

import { Activity as ServerActivity } from '~/lib/activity.types';
import { BriefResponse } from '~/lib/brief.types';
import { Database, Tables } from '~/lib/database.types';
import { File, File as ServerFile } from '~/lib/file.types';
import { Message as ServerMessage } from '~/lib/message.types';
import { Order as ServerOrder } from '~/lib/order.types';
import { Review as ServerReview } from '~/lib/review.types';
import { User as ServerUser } from '~/lib/user.types';
import { UnreadMessageCount } from '~/hooks/use-unread-message-counts';
import { FileUploadState } from '~/hooks/use-file-upload';

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
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  COMPLETE = 'complete',
}

export enum TableName {
  REVIEWS = 'reviews',
  MESSAGES = 'messages',
  ACTIVITIES = 'activities',
  FILES = 'files',
  ORDER = 'orders_v2',
}

export type ActivityExtended = Omit<ServerActivity.Response['data'][0], 'user'> & {
  user?: UserExtended | null;
};

export type ReactionExtended = {
  id: string;
  emoji: string;
  user: UserExtended;
  type: string;
};

export type UserExtended = Pick<
  ServerUser.Response,
  'id' | 'name' | 'email' | 'picture_url'
> & {
  settings?: {
    name: string | null;
    picture_url: string | null;
  }[] | null;
};

export type FileExtended = ServerFile.Response & {
  user?: UserExtended | null;
  isLoading?: boolean;
};

export type MessageExtended = Omit<ServerMessage.Response['data'][0], 'user' | 'files'> & {
  user?: UserExtended | null;
  files?: FileExtended[] | null;
  // reactions?: ReactionExtended[];
  pending?: boolean;
};

export type ReviewExtended = Omit<ServerReview.Response['data'][0], 'user'> & {
  user?: UserExtended | null;
};

export type OrderExtended = ServerOrder.Relational;

export type ServerOrderFile =
  Database['public']['Tables']['order_files']['Row'];

export type SubscriptionPayload =
  | ServerReview.Type
  | ServerMessage.Type
  | ServerActivity.Type
  | ServerFile.Type
  | ServerOrder.Type;

export type ActivityArray =
  | ActivityExtended[]
  | ReviewExtended[]
  | FileExtended[]
  | MessageExtended[];

export type ActivityObject = OrderExtended;

export type ActivityData = ActivityArray | ActivityObject;

export namespace DataSource {
  export type File = ServerFile.Type;
  export type Message = ServerMessage.Type;
  export type Review = ServerReview.Type;
  export type Activity = ServerActivity.Type;
  export type Order = ServerOrder.Type;

  export type ArrayTarget =
    | ServerFile.Type
    | ServerMessage.Type
    | ServerReview.Type
    | ServerActivity.Type;
  export type ObjectTarget = ServerOrder.Type;

  export type All = ArrayTarget | ObjectTarget;
}

export namespace DataResult {
  export type File = FileExtended;
  export type Message = MessageExtended;
  export type Review = ReviewExtended;
  export type Activity = ActivityExtended;
  export type Order = OrderExtended;
  export type Interaction = {
    messages: MessageExtended[];
    activities: ActivityExtended[];
    reviews: ReviewExtended[];
    // briefResponses: BriefResponse.Response[];
    nextCursor: string | null;
  }
  export type InteractionPages = {
    pages: Interaction[];
    pageParams: unknown[];
  } | undefined;
  export type ArrayTarget =
    | FileExtended
    | MessageExtended
    | ReviewExtended
    | ActivityExtended;

  export type ObjectTarget = OrderExtended;

  export type All = ArrayTarget | ObjectTarget;
}

export interface ActivityContextType {
  activities: DataResult.Activity[];
  messages: DataResult.Message[];
  reviews: DataResult.Review[];
  // files: DataResult.File[];
  // allFiles: DataResult.File[];
  order: DataResult.Order;
  orderId: number;
  briefResponses: BriefResponse.Response[];
  userRole: string;
  addMessageMutation: UseMutationResult<
    { message: ServerMessage.Insert; files: ServerFile.Insert[] },
    Error,
    {
      message: ServerMessage.Insert;
      files: ServerFile.Insert[];
      tempId: string;
    }
  >;
  userWorkspace: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    subscription_status: Tables<'subscriptions'>['status'] | null;
  };
  deleteMessage: UseMutationResult<
    JSONCustomResponse<null>,
    Error,
    {
      messageId: string;
      adminActived?: boolean;
    },
    {
      previousInteractions: DataResult.InteractionPages;
    }
  >;
  allFiles?: File.Response[];
  interactionsQuery: UseInfiniteQueryResult<DataResult.InteractionPages, Error>;
  getUnreadCountForOrder: (orderId: number) => number;
  markOrderAsRead: (orderId: number) => Promise<void>;
  unreadCounts: UnreadMessageCount[];
  fileUploads: FileUploadState[];
  handleFileUpload: (file: File, onComplete?: (upload: FileUploadState) => void | undefined) => Promise<void>;
  handleRemoveFile: (id: string) => void;
  isMobile: boolean;
}
