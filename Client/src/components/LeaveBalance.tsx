'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { apiClient } from '@/fetch/api';
import { User, LeaveRequest, LeaveType } from '@/types';
import { LEAVE_TYPE_LABELS } from '@/constants';

interface LeaveBalanceProps {
  user: User;
}

interface DynamicLeaveBalance {
  annual: number;
  sick: number;
  personal: number;
}

export default function LeaveBalance({ user }: LeaveBalanceProps) {
  const { leaveBalance: initialBalance } = user;
  const [dynamicBalance, setDynamicBalance] = useState<DynamicLeaveBalance>(initialBalance);
  const [loading, setLoading] = useState(true);
  const { requests } = useAppSelector((state) => state.leave);

  // Calculate used leave days
  const calculateUsedLeave = (requests: LeaveRequest[]) => {
    const usedLeave: DynamicLeaveBalance = {
      annual: 0,
      sick: 0,
      personal: 0,
    };

    requests.forEach((request) => {
      if (request.status === 'APPROVED') {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        switch (request.type) {
          case LeaveType.ANNUAL:
            usedLeave.annual += daysDiff;
            break;
          case LeaveType.SICK:
            usedLeave.sick += daysDiff;
            break;
          case LeaveType.PERSONAL:
            usedLeave.personal += daysDiff;
            break;
        }
      }
    });

    return usedLeave;
  };

  // Calculate remaining balance
  const calculateRemainingBalance = () => {
    const usedLeave = calculateUsedLeave(requests || []);
    return {
      annual: Math.max(0, initialBalance.annual - usedLeave.annual),
      sick: Math.max(0, initialBalance.sick - usedLeave.sick),
      personal: Math.max(0, initialBalance.personal - usedLeave.personal),
    };
  };

  // Update balance when requests change
  useEffect(() => {
    if (requests) {
      const remainingBalance = calculateRemainingBalance();
      setDynamicBalance(remainingBalance);
      setLoading(false);
    }
  }, [requests, initialBalance]);

  // Fetch requests if not already loaded
  useEffect(() => {
    const fetchRequests = async () => {
      if (!requests || requests.length === 0) {
        try {
          const response = await apiClient.get<LeaveRequest[]>('/leave/my-requests');
          // The requests will be updated via Redux, so we don't need to set them here
        } catch (error) {
          // Silently handle error
          setLoading(false);
        }
      }
    };
    fetchRequests();
  }, [requests]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="border-b border-slate-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">Leave Balance</h3>
        <p className="text-sm text-slate-700 font-medium">Your current leave allocation</p>
      </div>

      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(initialBalance).map(([type], index) => (
            <div 
              key={type} 
              className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl animate-pulse"
            >
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="text-right">
                <div className="h-8 bg-slate-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(dynamicBalance).map(([type, balance], index) => {
            const usedLeave = calculateUsedLeave(requests || []);
            const usedDays = usedLeave[type as keyof DynamicLeaveBalance];
            const totalDays = initialBalance[type as keyof DynamicLeaveBalance];
            
            return (
              <div 
                key={type} 
                className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-slate-100 hover:to-slate-200 transition-all duration-200 hover:shadow-md animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-semibold text-slate-800">
                    {LEAVE_TYPE_LABELS[type as keyof typeof LEAVE_TYPE_LABELS]}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">Days remaining</p>
                  {usedDays > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Used: {usedDays} of {totalDays} days
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{balance}</p>
                  <p className="text-xs text-slate-600 font-medium">days</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200/50">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-5 h-5 text-indigo-500 mt-0.5">
            💡
          </div>
          <p className="text-xs sm:text-sm text-indigo-800 font-medium">
            Contact HR if you need to request additional leave or have questions about your balance.
          </p>
        </div>
      </div>
    </div>
  );
}
