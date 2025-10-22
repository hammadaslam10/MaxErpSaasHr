'use client';

import { useAppSelector } from '@/redux/hooks';
import { LeaveStatus, LeaveRequest } from '@/types';

interface ManagerStatsProps {
  onStatusClick?: (status: LeaveStatus | 'ALL', requests: LeaveRequest[]) => void;
}

export default function ManagerStats({ onStatusClick }: ManagerStatsProps): JSX.Element {
  const { requests, pendingRequests } = useAppSelector((state) => state.leave);

  
  const allRequests = Array.isArray(requests) ? requests : [];
  const pendingRequestsList = Array.isArray(pendingRequests) ? pendingRequests : [];

  
  const totalPending = pendingRequestsList.length;
  const approvedRequests = allRequests.filter(req => req.status === LeaveStatus.APPROVED);
  const rejectedRequests = allRequests.filter(req => req.status === LeaveStatus.REJECTED);
  const totalApproved = approvedRequests.length;
  const totalRejected = rejectedRequests.length;
  const totalProcessed = totalApproved + totalRejected;

  const handleCardClick = (status: LeaveStatus | 'ALL', requests: LeaveRequest[]) => {
    if (onStatusClick) {
      onStatusClick(status, requests);
    }
  };

  const stats = [
    {
      name: 'Pending Requests',
      value: totalPending,
      color: 'bg-yellow-500',
      icon: '⏳',
      status: LeaveStatus.PENDING,
      requests: pendingRequestsList,
    },
    {
      name: 'Approved Today',
      value: totalApproved,
      color: 'bg-green-500',
      icon: '✅',
      status: LeaveStatus.APPROVED,
      requests: approvedRequests,
    },
    {
      name: 'Rejected Today',
      value: totalRejected,
      color: 'bg-red-500',
      icon: '❌',
      status: LeaveStatus.REJECTED,
      requests: rejectedRequests,
    },
    {
      name: 'Total Processed',
      value: totalProcessed,
      color: 'bg-blue-500',
      icon: '📊',
      status: 'ALL' as const,
      requests: allRequests,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <div 
          key={stat.name} 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer group"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => handleCardClick(stat.status, stat.requests)}
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-lg sm:text-xl shadow-lg group-hover:scale-110 transition-transform duration-200`}>
              {stat.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate group-hover:text-slate-800 transition-colors">
                {stat.name}
              </p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                {stat.value}
              </p>
              {stat.requests.length > 0 && (
                <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-600 transition-colors">
                  Click to view details
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
