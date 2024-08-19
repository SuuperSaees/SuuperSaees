'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import { getUserById } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { addOrderMessage } from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import { toast } from 'sonner';

import { Activity as ServerActivity } from '~/lib/activity.types';
import { File as ServerFile } from '~/lib/file.types';
import { Message as ServerMessage } from '~/lib/message.types';
import { Order } from '~/lib/order.types';
import { Review as ServerReview } from '~/lib/review.types';
import { User as ServerUser } from '~/lib/user.types';

import { useOrderSubscriptions } from '../hooks/use-subscriptions';

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
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export type Activity = ServerActivity.Type & {
  user: User;
};

export type Reaction = {
  id: string;
  emoji: string;
  user: User;
  type: string;
};

export type User = Pick<
  ServerUser.Type,
  'id' | 'name' | 'email' | 'picture_url'
>;

export type File = ServerFile.Type & {
  user: User;
};

export type Message = ServerMessage.Type & {
  user: User;
  files?: ServerFile.Type[];
  reactions?: Reaction[];
};

export type Review = ServerReview.Type & {
  user: User;
};

export type SubscriptionPayload =
  | ServerReview.Type
  | ServerMessage.Type
  | ServerActivity.Type
  | ServerFile.Type;

export type ActivityData = Review | File | Message | Activity;

interface ActivityContextType {
  activities: Activity[];
  messages: Message[];
  reviews: Review[];
  files: File[];
  order: Order.Type;
  writeMessage: (message: string) => Promise<void>;
}
export const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined,
);

export enum TableName {
  REVIEWS = 'reviews',
  MESSAGES = 'messages',
  ACTIVITIES = 'activities',
  FILES = 'files',
}

export const ActivityProvider = ({
  children,
  activities: serverActivities,
  messages: serverMessages,
  reviews: serverReviews,
  files: serverFiles,
  order: serverOrder,
}: {
  children: ReactNode;
  activities: Activity[];
  messages: Message[];
  reviews: Review[];
  files: File[];
  order: Order.Type;
}) => {
  const [order, setOrder] = useState<Order.Type>(serverOrder);
  const [messages, setMessages] = useState<Message[]>(serverMessages);
  const [activities, setActivities] = useState<Activity[]>(serverActivities);
  const [reviews, setReviews] = useState<Review[]>(serverReviews);
  const [files, setFiles] = useState<File[]>(serverFiles);

  const writeMessage = async (message: string) => {
    try {
      const messageToSend = {
        content: message,
        user_id: '2bd7eb2d-bb28-42f5-ac89-35d2b1f590b1' ?? '',
        order_id: Number(order.id),
      };
      await addOrderMessage(Number(order.id), messageToSend);
      toast.success('Success', {
        description: 'The message has been sent.',
      });
    } catch (error) {
      toast.error('Error', {
        description: 'The message could not be sent.',
      });
    }
  };

  // handling realtime subscriptions
  const reconcileData = useCallback(
    (
      pureDataSource: SubscriptionPayload,
      dataTarget: ActivityData[],
      tableName: TableName,
    ) => {
      let newDataUser = dataTarget.find(
        (data) => data.user.id === pureDataSource.user_id,
      )?.user as User;

      if (!newDataUser) {
        getUserById(pureDataSource.user_id)
          .then((user) => {
            newDataUser = user as User;
          })
          .catch((err) => {
            console.log(err);
          });
      }

      let nestedFiles = undefined;

      if (tableName === TableName.MESSAGES) {
        const hasRelatedFiles = () => {
          return files.some((file) => file.message_id === pureDataSource.id);
        };

        if (hasRelatedFiles()) {
          nestedFiles = files.filter(
            (file) => file.message_id === pureDataSource.id,
          );
        }
      }

      const reconciledData = {
        ...pureDataSource,
        user: newDataUser,
        files: nestedFiles,
      };

      return reconciledData;
    },
    [files], // Dependency array to ensure that `files` is up-to-date
  );

  const handleSubscription = useCallback(
    <T extends ActivityData>(
      payload: SubscriptionPayload,
      currentDataStore: T[],
      stateSetter: React.Dispatch<React.SetStateAction<T[]>>,
      tableName: TableName,
    ) => {
      const newData = reconcileData(payload, currentDataStore, tableName) as T;
      stateSetter((prev) => [...prev, newData]);
    },
    [reconcileData], // Dependency array ensures `handleSubscription` only updates when `reconcileData` changes
  );

  useOrderSubscriptions(
    order.id,
    handleSubscription,
    setOrder,
    activities,
    setActivities,
    messages,
    setMessages,
    reviews,
    setReviews,
    files,
    setFiles,
  );

  return (
    <ActivityContext.Provider
      value={{
        activities: activities,
        messages: messages,
        reviews: reviews,
        files: serverFiles.filter((svFile) => !svFile.message_id),
        order,
        writeMessage,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityContext = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error(
      'useActivityContext must be used within a ActivityProvider',
    );
  }
  return context;
};