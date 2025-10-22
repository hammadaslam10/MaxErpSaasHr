'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { addRequest, setError, clearError, setLoading } from '@/redux/slices/leaveSlice';
import { apiClient } from '@/fetch/api';
import { CreateLeaveRequestDto, LeaveType, LeaveRequest } from '@/types';
import { LEAVE_TYPE_LABELS } from '@/constants';
import { getDateValidationError, validateLeaveReason, getValidationError } from '@/utils/validation';
import { getTodayString, getTomorrowString } from '@/utils/dateUtils';

export default function LeaveForm() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateLeaveRequestDto>({
    type: LeaveType.ANNUAL,
    startDate: getTomorrowString(),
    endDate: getTomorrowString(),
    reason: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear global error
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate dates
    const dateError = getDateValidationError(formData.startDate, formData.endDate);
    if (dateError) {
      errors.startDate = dateError;
    }
    
    // Validate reason
    const reasonError = getValidationError('reason', formData.reason);
    if (reasonError) {
      errors.reason = reasonError;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<LeaveRequest>('/leave/apply', formData);
      
      dispatch(addRequest(response));
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        type: LeaveType.ANNUAL,
        startDate: getTomorrowString(),
        endDate: getTomorrowString(),
        reason: '',
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to submit leave request. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="border-b border-slate-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">Apply for Leave</h2>
        <p className="text-sm text-slate-700 font-medium">
          Submit a new leave request for approval
        </p>
      </div>

      {isSubmitted && (
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 animate-slide-up">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-5 h-5 text-emerald-500 mr-3">
              ✅
            </div>
            <p className="text-emerald-700 text-sm font-medium">
              Leave request submitted successfully!
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="group">
            <label htmlFor="type" className="block text-sm font-semibold text-slate-700 mb-2 transition-colors duration-200 group-focus-within:text-indigo-600">
              Leave Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label htmlFor="startDate" className="block text-sm font-semibold text-slate-700 mb-2 transition-colors duration-200 group-focus-within:text-indigo-600">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={getTodayString()}
              className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base ${
                formErrors.startDate 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-slate-300'
              }`}
            />
            {formErrors.startDate && (
              <p className="text-red-600 text-xs sm:text-sm mt-2 animate-shake">{formErrors.startDate}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="endDate" className="block text-sm font-semibold text-slate-700 mb-2 transition-colors duration-200 group-focus-within:text-indigo-600">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate}
              className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base ${
                formErrors.endDate 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-slate-300'
              }`}
            />
            {formErrors.endDate && (
              <p className="text-red-600 text-xs sm:text-sm mt-2 animate-shake">{formErrors.endDate}</p>
            )}
          </div>

          <div className="sm:col-span-2 group">
            <label htmlFor="reason" className="block text-sm font-semibold text-slate-700 mb-2 transition-colors duration-200 group-focus-within:text-indigo-600">
              Reason for Leave
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={4}
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Please provide a detailed reason for your leave request..."
              className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base resize-none ${
                formErrors.reason 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-slate-300'
              }`}
            />
            {formErrors.reason && (
              <p className="text-red-600 text-xs sm:text-sm mt-2 animate-shake">{formErrors.reason}</p>
            )}
            <p className="text-xs text-slate-600 font-medium mt-2">
              {formData.reason.length}/500 characters
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center animate-shake">
            <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Submit Leave Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
