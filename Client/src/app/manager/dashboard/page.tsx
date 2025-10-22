'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout, setAuth, setLoading as setAuthLoading } from '@/redux/slices/authSlice';
import { setPendingRequests, setRequests, setLoading } from '@/redux/slices/leaveSlice';
import { apiClient } from '@/fetch/api';
import { UserRole, LeaveRequest, LeaveStatus } from '@/types';
import { ROUTES } from '@/constants';
import PendingRequests from '@/components/PendingRequests';
import ManagerStats from '@/components/ManagerStats';
import FilteredRequestsModal from '@/components/FilteredRequestsModal';
import { deleteCookie, getCookie } from 'cookies-next';

export default function ManagerDashboardPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  const { pendingRequests, loading } = useAppSelector((state) => state.leave);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<LeaveStatus | 'ALL'>('ALL');
  const [modalRequests, setModalRequests] = useState<LeaveRequest[]>([]);

  // Restore authentication state on page refresh
  useEffect(() => {
    const restoreAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('maxerp_token') || (await getCookie('maxerp_token'));
        const userStr = localStorage.getItem('maxerp_user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            dispatch(setAuth({ user, token }));
        } catch {
          // Clear invalid stored data
          localStorage.removeItem('maxerp_token');
          localStorage.removeItem('maxerp_user');
          dispatch(setAuthLoading(false));
        }
        } else {
          dispatch(setAuthLoading(false));
        }
      } else {
        const token = await getCookie('maxerp_token');
        if (token) {
          dispatch(setAuthLoading(false));
        } else {
          dispatch(setAuthLoading(false));
        }
      }
    };
    
    restoreAuth();
  }, [dispatch]);

  // Handle routing based on authentication state
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push(ROUTES.LOGIN);
        return;
      }
      
      if (user.role !== UserRole.MANAGER) {
        router.push(ROUTES.DASHBOARD);
        return;
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  
  useEffect(() => {
    if (isAuthenticated && user?.role === UserRole.MANAGER) {
      const fetchAllRequests = async () => {
        dispatch(setLoading(true));
        try {
          // Fetch all requests for statistics
          const allRequestsResponse = await apiClient.get<LeaveRequest[]>('/leave/all-requests');
          dispatch(setRequests(allRequestsResponse));
          
          // Filter pending requests for the pending list
          const pendingRequests = allRequestsResponse.filter(req => req.status === 'PENDING');
          dispatch(setPendingRequests(pendingRequests));
        } catch {
          // Silently handle error and set empty arrays
          dispatch(setRequests([]));
          dispatch(setPendingRequests([]));
        } finally {
          dispatch(setLoading(false));
        }
      };
      fetchAllRequests();
    }
  }, [dispatch, isAuthenticated, user]);

  const handleStatusClick = (status: LeaveStatus | 'ALL', requests: LeaveRequest[]) => {
    setModalStatus(status);
    setModalRequests(requests);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalStatus('ALL');
    setModalRequests([]);
  };

  const handleLogout = () => {
    dispatch(logout());
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('maxerp_token');
      localStorage.removeItem('maxerp_user');
      deleteCookie('maxerp_token');
    }
    router.push(ROUTES.LOGIN);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== UserRole.MANAGER) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                  Manager Dashboard
                </h1>
                <p className="text-sm text-slate-600">
                  Welcome back, <span className="font-semibold text-indigo-600">{user.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-100 rounded-full px-3 sm:px-4 py-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-slate-700">{user.department} Manager</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 sm:py-3 sm:px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <ManagerStats onStatusClick={handleStatusClick} />

          {/* Pending Requests */}
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Pending Leave Requests
              </h2>
              <div className="flex items-center space-x-2">
                <div className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                  {Array.isArray(pendingRequests) ? pendingRequests.length : 0}
                </div>
                <span className="text-sm text-slate-500">
                  request{(Array.isArray(pendingRequests) ? pendingRequests.length : 0) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-slate-600 font-medium">Loading requests...</span>
              </div>
            ) : (
              <PendingRequests requests={Array.isArray(pendingRequests) ? pendingRequests : []} />
            )}
          </div>
        </div>
      </main>

      {/* Filtered Requests Modal */}
      <FilteredRequestsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        status={modalStatus}
        requests={modalRequests}
      />
    </div>
  );
}
