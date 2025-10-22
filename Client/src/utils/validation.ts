
import { getDateValidationError as validateDateRange } from './dateUtils';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

export const validateLeaveReason = (reason: string): boolean => {
  return reason.trim().length >= 10 && reason.trim().length <= 500;
};

export const getValidationError = (field: string, value: string): string | null => {
  switch (field) {
    case 'email':
      if (!validateRequired(value)) {
        return 'Email is required';
      }
      if (!validateEmail(value)) {
        return 'Please enter a valid email address';
      }
      break;
    
    case 'password':
      if (!validateRequired(value)) {
        return 'Password is required';
      }
      if (!validatePassword(value)) {
        return 'Password must be at least 6 characters long';
      }
      break;
    
    case 'reason':
      if (!validateRequired(value)) {
        return 'Reason is required';
      }
      if (!validateLeaveReason(value)) {
        return 'Reason must be between 10 and 500 characters';
      }
      break;
    
    case 'startDate':
    case 'endDate':
      if (!validateRequired(value)) {
        return 'Date is required';
      }
      break;
    
    default:
      if (!validateRequired(value)) {
        return 'This field is required';
      }
  }
  
  return null;
};

export const getDateValidationError = validateDateRange;
