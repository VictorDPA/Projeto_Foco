/**
 * Converts decimal hours to HH:MM:SS format
 * @param hours - decimal hours (e.g., 1.5 for 1 hour 30 minutes)
 * @returns formatted string in HH:MM:SS format
 */
export const formatHoursToHHMMSS = (hours: number): string => {
  const totalSeconds = Math.round(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Converts decimal hours to a compact display format
 * @param hours - decimal hours
 * @returns formatted string like "1h 30min" or "00:45:00" for times under 1h
 */
export const formatHoursCompact = (hours: number): string => {
  if (hours === 0) return '00:00:00';
  return formatHoursToHHMMSS(hours);
};
