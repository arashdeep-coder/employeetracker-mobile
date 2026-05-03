/**
 * Shared TypeScript interfaces and types.
 */

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'employee' | 'owner';
  orgId: string;
}

export interface AttendanceLog {
  id: string;
  punchInTime: string; // ISO date string
  punchOutTime: string | null;
  totalMinutes: number | null;
  status: 'active' | 'completed';
  punchInLat: number;
  punchInLng: number;
  userName?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface AttendanceContextType {
  activeSession: AttendanceLog | null;
  isLoading: boolean;
  isPunching: boolean;
  punchIn: () => Promise<void>;
  punchOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
