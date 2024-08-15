'use client';

import { ReactNode, createContext, useContext } from 'react';

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
}: {
  children: ReactNode;
  activities: Activity[];
  messages: Message[];
  reviews: Review[];
  files: File[];
}) => {
  return (
    <ActivityContext.Provider
      value={{
        activities,
        messages,
        reviews,
        files,
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
