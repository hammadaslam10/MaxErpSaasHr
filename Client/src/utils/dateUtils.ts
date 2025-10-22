import { format, parseISO, isValid, differenceInDays, isAfter, isBefore, startOfDay } from 'date-fns';

export const formatDate = (dateString: string, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return 'Invalid Date';
    }
    return format(date, formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateForInput = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return '';
    }
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
};

export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getTomorrowString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return format(tomorrow, 'yyyy-MM-dd');
};

export const calculateDaysBetween = (startDate: string, endDate: string): number => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (!isValid(start) || !isValid(end)) {
      return 0;
    }
    
    return differenceInDays(end, start) + 1;
  } catch (error) {
    return 0;
  }
};

export const isDateInPast = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    const today = startOfDay(new Date());
    
    if (!isValid(date)) {
      return true;
    }
    
    return isBefore(date, today);
  } catch (error) {
    return true;
  }
};

export const isStartBeforeEnd = (startDate: string, endDate: string): boolean => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (!isValid(start) || !isValid(end)) {
      return false;
    }
    
    return isBefore(start, end) || start.getTime() === end.getTime();
  } catch (error) {
    return false;
  }
};

export const doDateRangesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  try {
    const s1 = parseISO(start1);
    const e1 = parseISO(end1);
    const s2 = parseISO(start2);
    const e2 = parseISO(end2);
    
    if (!isValid(s1) || !isValid(e1) || !isValid(s2) || !isValid(e2)) {
      return false;
    }
    
    return s1 <= e2 && s2 <= e1;
  } catch (error) {
    return false;
  }
};

export const getDateValidationError = (startDate: string, endDate: string): string | null => {
  if (isDateInPast(startDate)) {
    return 'Start date cannot be in the past';
  }
  
  if (!isStartBeforeEnd(startDate, endDate)) {
    return 'End date must be on or after start date';
  }
  
  const days = calculateDaysBetween(startDate, endDate);
  if (days > 30) {
    return 'Leave request cannot exceed 30 days';
  }
  
  return null;
};
