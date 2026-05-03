import { format, formatDistanceStrict, parseISO } from 'date-fns';

/**
 * Formats an ISO string to a readable time (e.g., 09:30 AM).
 */
export function formatTime(isoString: string): string {
  if (!isoString) return '--:--';
  try {
    return format(parseISO(isoString), 'hh:mm a');
  } catch {
    return '--:--';
  }
}

/**
 * Formats an ISO string to a readable date (e.g., Mon, May 1).
 */
export function formatDate(isoString: string): string {
  if (!isoString) return '---';
  try {
    return format(parseISO(isoString), 'EEE, MMM d');
  } catch {
    return '---';
  }
}

/**
 * Calculates and formats the duration between two ISO strings.
 */
export function formatDuration(start: string, end?: string | null): string {
  if (!start) return '0h 0m';
  try {
    const startTime = parseISO(start);
    const endTime = end ? parseISO(end) : new Date();
    
    const diffMs = Math.max(0, endTime.getTime() - startTime.getTime());
    const diffMinsTotal = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinsTotal / 60);
    const mins = diffMinsTotal % 60;
    
    return `${hours}h ${mins}m`;
  } catch {
    return '0h 0m';
  }
}
