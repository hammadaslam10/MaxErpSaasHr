export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
}

export interface LeaveBalance {
  annual: number;
  sick: number;
  personal: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  leaveBalance: LeaveBalance;
  createdAt: string;
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
}

export interface CreateLeaveRequestDto {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveRequestDto {
  status: LeaveStatus;
  comments?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
  error?: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export interface RootState {
  auth: AuthState;
  leave: LeaveState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LeaveState {
  requests: LeaveRequest[];
  pendingRequests: LeaveRequest[];
  loading: boolean;
  error: string | null;
}