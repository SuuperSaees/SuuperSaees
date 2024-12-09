'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { addOrderMessage } from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import { toast } from 'sonner';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { Activity as ServerActivity } from '~/lib/activity.types';
import { Database, Tables } from '~/lib/database.types';
import { File as ServerFile } from '~/lib/file.types';
import { Message } from '~/lib/message.types';
import { Message as ServerMessage } from '~/lib/message.types';
import { Order } from '~/lib/order.types';
import { Review as ServerReview } from '~/lib/review.types';
import { User as ServerUser } from '~/lib/user.types';
import { generateUUID } from '~/utils/generate-uuid';

import useInternalMessaging from '../hooks/use-messages';
import { useOrderSubscriptions } from '../hooks/use-subscriptions';
import { updateFile } from 'node_modules/@kit/team-accounts/src/server/actions/files/update/update-file';

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
  addMessage: ({message, fileIdsList}: {message: string, fileIdsList?: string[]}) => Promise<ServerMessage.Type>;
  userWorkspace: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    subscription_status: Tables<"subscriptions">["status"] | null;
  }
  loadingMessages: boolean;
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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { workspace: currentUser } = useUserWorkspace();
  const writeMessage = async ({message, fileIdsList}: {message: string, fileIdsList?: string[]}, tempId: string) => {
    const messageId = crypto.randomUUID()
    try {

      const messageToSend = {
        id: messageId,
        content: message,
        order_id: Number(order.id),
        visibility: getInternalMessagingEnabled()
          ? 'internal_agency'
          : 'public',
        temp_id: tempId,
      };
      const newMessage = await addOrderMessage(
        currentUser.id ?? '',
        Number(order.id),
        messageToSend,
        messageToSend.visibility as Message.Type['visibility'],
      );
      // If there are file IDs, update the files with the new message ID
      if (fileIdsList && fileIdsList.length > 0) {
        for (const fileId of fileIdsList) {
          await updateFile(fileId, messageId);
        }
      }

      toast.success('Success', {
        description: 'The message has been sent.',
      });

      return newMessage;
    } catch (error) {
      toast.error('Error', {
        description: 'The message could not be sent.',
      });
      throw error;
    } finally {
      setLoadingMessages(false)
    }
  };

  const addMessageMutation = useMutation({
    mutationFn: ({ message, fileIdsList, tempId }: { message: string; fileIdsList?: string[], tempId: string }) =>
      writeMessage({message, fileIdsList}, tempId),
    onMutate: async ({ message, tempId }) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      setLoadingMessages(true);
      await queryClient.cancelQueries({
        queryKey: ['messages'],
      });

      const optimisticMessage: Message = {
        id: 'temp-' + tempId, // Temporary ID
        content: message,
        order_id: Number(order.id),
        visibility: getInternalMessagingEnabled()
          ? 'internal_agency'
          : 'public',
        created_at: new Date().toISOString(),
        user: {
          id: currentUser?.id ?? '',
          name: currentUser?.name ?? '',
          email: currentUser?.email ?? '',
          picture_url: currentUser.picture_url ?? '',
        },
        user_id: currentUser?.id ?? '',
        files: [], // Default to an empty array if not provided
        reactions: [], // Default to an empty array if not provided,
        temp_id: tempId,
        pending: true,
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
      const realMessage = {
        ...newMessage,
        user: context.optimisticMessage.user,
        files: [],
        reactions: [],
      };
      setMessages((prevMessages) => {
        return reconcileState(prevMessages, realMessage) as Message[];
      });
    },
    onSettled: () => {
      setLoadingMessages(false);
    }
  });

  const reconcileState = (items: ActivityData[], newItem: ActivityData) => {
    const itemsMatch = (tempItem: ActivityData, newItem: ActivityData) => {
      return tempItem?.temp_id === newItem?.temp_id;
    };
    // avoid duplicate items
    if (
      !items.some(
        (msg) => msg.id === newItem.id ,
      )
    ) {
      const existingIndex = items.findIndex((item) =>
        itemsMatch(item, newItem),
      );

      if (existingIndex !== -1) {
        // Replace the existing item
        return items.map((item, index) =>
          index === existingIndex ? newItem : item,
        );
      } else {
        // Append the new item if it doesn't already exist
        return [...items, newItem];
      }
    } else {
      return items;
    }
  };

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
      } else if (tableName === TableName.FILES) {
        const fileData = pureDataSource as ServerFile.Type;
        if (fileData.message_id) {
          setMessages((prevMessages) => {
            return prevMessages.map((msg) => {
              if (msg.id === fileData.message_id) {
                return {
                  ...msg,
                  files: [...(msg.files ?? []), { ...fileData, user: newDataUser }],
                };
              }
              return msg;
            });
          });
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
      tableName: TableName,
    ) => {
      try {
        const newData = (await reconcileData(
          payload,
          currentDataStore,
          tableName,
        )) as T;
        if(tableName === TableName.MESSAGES) {

          stateSetter((prevState) => {
            return reconcileState(prevState, newData) as T[];
          });
        } else { 
          stateSetter((prevState) => [...prevState, newData]);
        }
      } catch (error) {
        console.error('Error handling subscription:', error);
      }
    },
    [reconcileData],
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
        files: files.filter((svFile) => !svFile.message_id),
        order,
        userRole,
        addMessage: async ({message, fileIdsList}: {message: string, fileIdsList?: string[]}) =>
          await addMessageMutation.mutateAsync({
            message,
            fileIdsList,
            tempId: generateUUID(),
          }),
        userWorkspace: currentUser,
        loadingMessages
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
