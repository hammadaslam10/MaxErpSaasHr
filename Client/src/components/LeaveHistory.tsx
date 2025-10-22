'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setRequests, setLoading } from '@/redux/slices/leaveSlice';
import { apiClient } from '@/fetch/api';
import { LeaveRequest, LeaveStatus } from '@/types';
import { LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS, LEAVE_STATUS_COLORS } from '@/constants';
import { formatDate } from '@/utils/dateUtils';

export default function LeaveHistory() {
  const dispatch = useAppDispatch();
  const { requests, loading } = useAppSelector((state) => state.leave);

  
  useEffect(() => {
    const fetchRequests = async () => {
      dispatch(setLoading(true));
      try {
        const response = await apiClient.get<LeaveRequest[]>('/leave/my-requests');
        dispatch(setRequests(response));
      } catch (error) {
        // Silently handle error and set empty array
        dispatch(setRequests([]));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchRequests();
  }, [dispatch]);

  const displayRequests = requests;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="border-b border-slate-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">Leave History</h3>
        <p className="text-sm text-slate-600">Your recent leave requests</p>
      </div>

      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm sm:text-base">Loading your leave requests...</p>
        </div>
      ) : displayRequests.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-slate-400 text-4xl sm:text-6xl mb-4">📅</div>
          <p className="text-slate-500 text-sm sm:text-base">No leave requests found</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {displayRequests.map((request, index) => (
            <div 
              key={request.id} 
              className="border border-slate-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                    <span className="text-sm sm:text-base font-semibold text-slate-900">
                      {LEAVE_TYPE_LABELS[request.type]}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'PENDING' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : request.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {LEAVE_STATUS_LABELS[request.status]}
                    </span>
                  </div>
                  
                  <div className="text-xs sm:text-sm text-slate-600 space-y-1 sm:space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                      <p>
                        <span className="font-semibold">Dates:</span>{' '}
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </p>
                      <p>
                        <span className="font-semibold">Applied:</span>{' '}
                        {formatDate(request.appliedAt)}
                      </p>
                    </div>
                    
                    <p>
                      <span className="font-semibold">Reason:</span> {request.reason}
                    </p>
                    
                    {request.reviewedAt && (
                      <p>
                        <span className="font-semibold">Reviewed:</span>{' '}
                        {formatDate(request.reviewedAt)}
                        {request.reviewedBy && ` by ${request.reviewedBy}`}
                      </p>
                    )}
                    
                    {request.comments && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Manager Comments:</p>
                        <p className="text-slate-600">{request.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
