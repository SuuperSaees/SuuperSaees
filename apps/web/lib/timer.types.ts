import { Database } from './database.types';

export type Timer = {
  id?: string | null;
  elementId: string | null;
  elementType: string | null;
  elementName: string | null;
  startTime: number | null;
  endTime?: number | null;
  elapsedTime?: number;
  timestamp?: string;
};

export interface TimerUpdate {
  id?: string;
  user_id?: string;
  start_time?: number | null;
  elapsed_time?: number;
  end_time?: number | null;
  status?: string;
  name?: string;
  deleted_on?: number;
}

export interface TimeTrackerContextType {
  activeTimer: Timer;
  setActiveTimer: (data: Timer) => void;
  clearTimer: () => void;
}

export namespace DatabaseTimer {
  export type Type = Database['public']['Tables']['timers']['Row'];
  export type Insert = Database['public']['Tables']['timers']['Insert'];
  export type Update = Database['public']['Tables']['timers']['Update'];
}