import { Timer, TimerUpdate } from "~/lib/timer.types";
import { formatTime, formatTimeInHours } from "./format-time";

export const handleStartTimeChange = (value: string, setStartTime: (time: number) => void) => {
    const [hours, minutes] = value.split(':').map(Number);
    const now = new Date();
    const newStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).getTime();
    setStartTime(newStartTime);
};

export const handleStartTimeUpdate = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    const now = new Date();
    const newStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).getTime();
    return newStartTime
};

export const handleEndTimeUpdate = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    const now = new Date();
    const newEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).getTime();
    return newEndTime
};

export const handleEndTimeChange = (value: string, setEndTime: (time: number) => void) => {
    const [hours, minutes] = value.split(':').map(Number);
    const now = new Date();
    const newEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).getTime();
    setEndTime(newEndTime);
};

export const handlePauseConfirm = async (
    activeTimer: Timer, 
    onUpdate: (timerId: string, timer: TimerUpdate) => Promise<void>,
    timerName: string,
    startTime: number,
    endTime: number,
    setActiveTimer: (timer: Timer) => void, 
    clearTimer: () => void,
    setTime: (time: number) => void,
    setTimerName: (name: string) => void,
    setShowPauseDialog: (show: boolean) => void,
    setIsSaving: (saving: boolean) => void
) => {
    try {
        setIsSaving(true);
        const timerUpdate = {
            name: timerName,
            elapsed_time: formatTime(formatTimeInHours(startTime, endTime)),
            start_time: startTime,
            end_time: endTime,
            status: 'finished'
        };

        await onUpdate(activeTimer.id!, timerUpdate);
        
        setActiveTimer({
            id: null,
            elementId: null,
            elementType: null,
            elementName: null,
            startTime: null,
            elapsedTime: 0,
        });

        clearTimer();
        setTime(0);
        setTimerName('');
        setShowPauseDialog(false);
    } catch (error) {
        console.error('Error updating timer:', error);
    } finally {
        setIsSaving(false);
    }
};


export const calculateTotalTime = (timers: any[]) => {
    if (!timers?.length) return '00:00:00';
    
    return timers.reduce((total, timer) => {
      const time = timer.timers.timestamp.split(':').map(Number);
      const [currentHours, currentMinutes, currentSeconds] = total.split(':').map(Number);
      const [timerHours, timerMinutes, timerSeconds] = time;

      let seconds = currentSeconds + timerSeconds;
      let minutes = currentMinutes + timerMinutes;
      let hours = currentHours + timerHours;

      if (seconds >= 60) {
        minutes += Math.floor(seconds / 60);
        seconds = seconds % 60;
      }
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, '00:00:00');
};