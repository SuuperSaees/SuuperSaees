export function formatElapsedTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export const formatTimeToAMPM = (timestamp: number | null): string => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};
  
export const formatDayAndTime = (timestamp: number, t: (key: string) => string) => {
  const date = new Date(timestamp);
  const days = [t('timers.sunday'), t('timers.monday'), t('timers.tuesday'), t('timers.wednesday'), t('timers.thursday'), t('timers.friday'), t('timers.saturday')];
  const dayName = days[date.getDay()];
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12;
  
  return `${dayName} ${formattedHours}:${minutes} ${ampm}`;
};