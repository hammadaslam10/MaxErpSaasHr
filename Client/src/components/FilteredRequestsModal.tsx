'use client';

import { useState, useEffect } from 'react';
import { LeaveRequest, LeaveStatus } from '@/types';
import { format } from 'date-fns';

interface FilteredRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: LeaveStatus | 'ALL';
  requests: LeaveRequest[];
}

export default function FilteredRequestsModal({ 
  isOpen, 
  onClose, 
  status, 
  requests 
}: FilteredRequestsModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case LeaveStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return '✅';
      case LeaveStatus.REJECTED:
        return '❌';
      case LeaveStatus.PENDING:
        return '⏳';
      default:
        return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ANNUAL':
        return 'bg-blue-100 text-blue-800';
      case 'SICK':
        return 'bg-orange-100 text-orange-800';
      case 'PERSONAL':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {status === 'ALL' ? 'All Leave Requests' : `${status} Leave Requests`}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {requests.length} request{requests.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No requests found</h3>
              <p className="text-slate-600">There are no {status.toLowerCase()} leave requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div 
                  key={request.id}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{request.employeeName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)} {request.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                          {request.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{request.employeeEmail}</p>
                      <p className="text-sm text-slate-700">{request.reason}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Start Date:</span>
                      <p className="text-slate-900">{format(new Date(request.startDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">End Date:</span>
                      <p className="text-slate-900">{format(new Date(request.endDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Applied:</span>
                      <p className="text-slate-900">{format(new Date(request.appliedAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    {request.reviewedAt && (
                      <div>
                        <span className="font-medium text-slate-600">Reviewed:</span>
                        <p className="text-slate-900">{format(new Date(request.reviewedAt), 'MMM dd, yyyy HH:mm')}</p>
                      </div>
                    )}
                  </div>

                  {request.reviewedBy && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className="font-medium text-slate-600">Reviewed by:</span>
                      <p className="text-slate-900">{request.reviewedBy}</p>
                    </div>
                  )}

                  {request.comments && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className="font-medium text-slate-600">Comments:</span>
                      <p className="text-slate-900 mt-1">{request.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
