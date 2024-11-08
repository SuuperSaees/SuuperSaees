'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

import { toast } from 'sonner';
import { Service } from '~/lib/services.types';


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



interface ActivityContextType {
  service: Service.Type;
}
export const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined,
);

export const ActivityProvider = ({
  children,
  service: serverService,
}: {
  children: ReactNode;
  service: Service.Type;
}) => {
  const [service, setService] = useState<Service.Type>(serverService);

  return (
    <ActivityContext.Provider
      value={{
        service,
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