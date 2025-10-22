export interface ApiResponse<T = any> {
  error: boolean;
  data?: T;
  message: string;
}

export interface ApiError {
  error: boolean;
  data?: undefined;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface ResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationError[];
}