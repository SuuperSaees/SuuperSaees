'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { getUserById } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { addOrderMessage } from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import { toast } from 'sonner';

import { Activity as ServerActivity } from '~/lib/activity.types';
import { Database } from '~/lib/database.types';
import { File as ServerFile } from '~/lib/file.types';
import { Message } from '~/lib/message.types';
import { Message as ServerMessage } from '~/lib/message.types';
import { Order } from '~/lib/order.types';
import { Review as ServerReview } from '~/lib/review.types';
import { User as ServerUser } from '~/lib/user.types';
import { generateUUID } from '~/utils/generate-uuid';

import useInternalMessaging from '../hooks/use-messages';
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
  TASK = 'task',
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  COMPLETE = 'complete',
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

export type ServerOrderFile =
  Database['public']['Tables']['order_files']['Row'];
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
  userRole: string;
  // writeMessage: (message: string) => Promise<ServerMessage.Type>;
  addMessageMutation: UseMutationResult<Message.Type, Error, string, unknown>;
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
  userRole,
}: {
  children: ReactNode;
  activities: Activity[];
  messages: Message[];
  reviews: Review[];
  files: File[];
  order: Order.Type;
  userRole: string;
}) => {
  const [order, setOrder] = useState<Order.Type>(serverOrder);
  const [messages, setMessages] = useState<Message[]>(serverMessages);
  const [activities, setActivities] = useState<Activity[]>(serverActivities);
  const [reviews, setReviews] = useState<Review[]>(serverReviews);
  const [files, setFiles] = useState<File[]>(serverFiles);
  const { getInternalMessagingEnabled } = useInternalMessaging();
  const queryClient = useQueryClient();
  // e06d49a5-939a-4b7a-b135-81f7e6e7c5cb
  const writeMessage = async (message: string, tempId: string) => {
    try {
      const messageToSend = {
        content: message,
        order_id: Number(order.id),
        visibility: getInternalMessagingEnabled()
          ? 'internal_agency'
          : 'public',
        temp_id: tempId,
      };
      const newMessage = await addOrderMessage(
        Number(order.id),
        messageToSend,
        messageToSend.visibility as Message.Type['visibility'],
      );
      toast.success('Success', {
        description: 'The message has been sent.',
      });
      return newMessage;
    } catch (error) {
      toast.error('Error', {
        description: 'The message could not be sent.',
      });
      throw error;
    }
  };

  const removeOptimisticResponses = (messages: Message[], tempId?: string) => {
    if (!tempId) {
      return messages;
    }
    console.log('removeOptimisticResponses', messages, tempId);
    return messages.filter(
      (msg) => msg.temp_id !== tempId && !msg.id.startsWith('temp-'),
    );
  };

  const addMessageMutation = useMutation({
    mutationFn: ({ message, tempId }: { message: string; tempId: string }) =>
      writeMessage(message, tempId),
    onMutate: async ({ message, tempId }) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      console.log('message', message);
      await queryClient.cancelQueries({
        queryKey: ['messages'],
      });

      const optimisticMessage: Message = {
        id: 'temp-' + Date.now().toString(), // Temporary ID
        content: message,
        order_id: Number(order.id),
        visibility: getInternalMessagingEnabled()
          ? 'internal_agency'
          : 'public',
        created_at: new Date().toISOString(),
        user: {
          id: 'e06d49a5-939a-4b7a-b135-81f7e6e7c5cb', // Replace with the actual user's ID
          name: 'Juan', // Replace with the current user's name
          email: 'juan.garzon+softlink@suuper.co', // Replace with the current user's email
          picture_url: '', // Optionally, use the current user's picture
        },
        user_id: 'e06d49a5-939a-4b7a-b135-81f7e6e7c5cb',
        files: [], // Default to an empty array if not provided
        reactions: [], // Default to an empty array if not provided,
        temp_id: tempId,
      };

      setMessages((oldMessages) => [...oldMessages, optimisticMessage]);

      // Return the snapshot in case of rollback
      return { optimisticMessage };
    },
    onError: (_error, _variables, context) => {
      setMessages((prevMessages) =>
        prevMessages.filter(
          (msg) => msg.temp_id !== context?.optimisticMessage.temp_id,
        ),
      );
      toast.error('Error', {
        description: 'The message could not be sent.',
      });
    },
    onSuccess: (newMessage, _variables, context) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === context?.optimisticMessage.id && msg.temp_id === context?.optimisticMessage.temp_id
            ? {
                ...newMessage,
                user: context.optimisticMessage.user,
                files: [],
                reactions: [],
              }
            : msg
        )
      );
    },
  });

  const reconcileData = useCallback(
    async (
      pureDataSource: SubscriptionPayload,
      dataTarget: ActivityData[],
      tableName: TableName,
    ) => {
      let newDataUser = dataTarget.find(
        (data) => data?.user?.id === pureDataSource?.user_id,
      )?.user as User;

      if (!newDataUser) {
        try {
          newDataUser = await getUserById(pureDataSource.user_id);
        } catch (err) {
          console.error('Error fetching user:', err);
          throw err; // Rethrow the error if you want the caller to handle it
        }
      }

      let nestedFiles = [];

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
    async <T extends ActivityData>(
      payload: SubscriptionPayload,
      currentDataStore: T[],
      stateSetter: React.Dispatch<React.SetStateAction<T[]>>,
      tableName: TableName
    ) => {
      try {
        const newData = (await reconcileData(
          payload,
          currentDataStore,
          tableName
        )) as T;

        if (tableName === TableName.MESSAGES) {
          const newMessage = await reconcileData(payload, currentDataStore, tableName);

          stateSetter((prevMessages) => {
            const existingOptimistic = prevMessages.find(
              (msg) => msg.temp_id === newMessage.temp_id
            );
    
            if (existingOptimistic) {
              // Replace the optimistic message with the server message
              return prevMessages.map((msg) =>
                msg.temp_id === newMessage.temp_id ? newMessage : msg
              );
            }
    
            // If not an optimistic message, simply add the new one
            return [...prevMessages, newMessage];
          });
        } else {
          stateSetter((prev) => [...prev, newData]);
        }
      } catch (error) {
        console.error('Error handling subscription:', error);
      }
    },
    [reconcileData]
  );
  console.log('messages', messages);
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
        files: files.filter((svFile) => !svFile.message_id),
        order,
        userRole,
        addMessageMutation: async (message: string) =>
          await addMessageMutation.mutateAsync({
            message,
            tempId: generateUUID(),
          }),
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
