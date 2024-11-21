export type Timer = {
  subtaskId: string | null;
  taskId: string | null;
  subtaskName: string | null;
  startTime: number | null;
  elapsedTime: number;
};

export interface TimeTrackerContextType {
  activeTimer: Timer;
  setActiveTimer: (data: Timer) => void;
}
