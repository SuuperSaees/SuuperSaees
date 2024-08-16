'use client';

import { ReactNode, createContext, useContext } from 'react';



import { addOrderMessage } from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import { toast } from 'sonner';



import { Order } from '~/lib/order.types';

export enum ActivityType {
  MESSAGE = 'message',
  REVIEW = 'review',
  STATUS = 'status',
  PRIORITY = 'priority',
  ASSIGN = 'assign',
  DUE_DATE = 'due_date',
  DESCRIPTION = 'description',
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}
export type Activity = {
  id: string;
  type: ActivityType;
  action: ActionType;
  message: string;
  created_at: string;
  user: User;
};
export type Reaction = {
  id: string;
  emoji: string;
  user: User;
  type: string;
};
export type User = {
  id: string;
  name: string;
  email: string;
  picture_url: string | null;
};
export type File = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
};

export type Message = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
  files: File[];
  reactions: Reaction[];
};
export type Review = {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
};
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

export const ActivityProvider = ({
  children,
  activities,
  messages,
  reviews,
  files,
  order,
}: {
  children: ReactNode;
  activities: Activity[];
  messages: Message[];
  reviews: Review[];
  files: File[];
  order: Order.Type;
}) => {
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

  return (
    <ActivityContext.Provider
      value={{
        activities,
        messages,
        reviews,
        files,
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