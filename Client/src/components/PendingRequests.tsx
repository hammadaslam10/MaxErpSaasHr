'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { updateRequest } from '@/redux/slices/leaveSlice';
import { apiClient } from '@/fetch/api';
import { LeaveRequest, LeaveStatus, UpdateLeaveRequestDto } from '@/types';
import { LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS } from '@/constants';
import { formatDate } from '@/utils/dateUtils';

interface PendingRequestsProps {
  requests: LeaveRequest[] | undefined | null;
}

export default function PendingRequests({ requests }: PendingRequestsProps) {
  const dispatch = useAppDispatch();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  
  const safeRequests = Array.isArray(requests) ? requests : [];

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const updateData: UpdateLeaveRequestDto = {
        status: LeaveStatus.APPROVED,
        comments: comments[requestId] || undefined,
      };
      const response = await apiClient.post<LeaveRequest>(`/leave/approve/${requestId}`, updateData);
      
      dispatch(updateRequest(response));
    } catch (error) {
      alert('Failed to approve request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const updateData: UpdateLeaveRequestDto = {
        status: LeaveStatus.REJECTED,
        comments: comments[requestId] || undefined,
      };
      const response = await apiClient.post<LeaveRequest>(`/leave/approve/${requestId}`, updateData);
      
      dispatch(updateRequest(response));
    } catch (error) {
      alert('Failed to reject request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCommentChange = (requestId: string, value: string) => {
    setComments(prev => ({ ...prev, [requestId]: value }));
  };

  if (safeRequests.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 animate-fade-in">
        <div className="text-slate-400 text-6xl sm:text-8xl mb-4 sm:mb-6">📋</div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No Pending Requests</h3>
        <p className="text-slate-500 text-sm sm:text-base">All leave requests have been processed</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {safeRequests.map((request, index) => (
        <div 
          key={request.id} 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-3">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {request.employeeName}
                </h4>
                <span className="text-xs sm:text-sm text-slate-500 truncate">
                  {request.employeeEmail}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <p className="text-slate-600">
                    <span className="font-semibold">Leave Type:</span>{' '}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {LEAVE_TYPE_LABELS[request.type]}
                    </span>
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold">Dates:</span>{' '}
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-600">
                    <span className="font-semibold">Applied:</span>{' '}
                    {formatDate(request.appliedAt)}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold">Department:</span> Engineering
                  </p>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4">
                <p className="text-slate-600 text-sm sm:text-base">
                  <span className="font-semibold">Reason:</span> {request.reason}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 sm:pt-6">
            <div className="mb-4 sm:mb-6">
              <label htmlFor={`comments-${request.id}`} className="block text-sm font-semibold text-slate-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                id={`comments-${request.id}`}
                rows={3}
                value={comments[request.id] || ''}
                onChange={(e) => handleCommentChange(request.id, e.target.value)}
                placeholder="Add any comments for the employee..."
                className="w-full px-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => handleReject(request.id)}
                disabled={processingId === request.id}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {processingId === request.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Reject</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleApprove(request.id)}
                disabled={processingId === request.id}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {processingId === request.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Approve</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
