'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout, setAuth, setLoading } from '@/redux/slices/authSlice';
import { UserRole } from '@/types';
import { ROUTES } from '@/constants';
import LeaveForm from '@/components/LeaveForm';
import LeaveHistory from '@/components/LeaveHistory';
import LeaveBalance from '@/components/LeaveBalance';
import { deleteCookie, getCookie } from 'cookies-next';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

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
        } catch (error) {
          // Clear invalid stored data
          localStorage.removeItem('maxerp_token');
          localStorage.removeItem('maxerp_user');
          dispatch(setLoading(false));
        }
        } else {
          dispatch(setLoading(false));
        }
      } else {
        const token = await getCookie('maxerp_token');
        if (token) {
          dispatch(setLoading(false));
        } else {
          dispatch(setLoading(false));
        }
      }
    };
    
    restoreAuth();
  }, [dispatch]);

  // Handle routing based on authentication state
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push(ROUTES.LOGIN);
        return;
      }
      
      if (user.role === UserRole.MANAGER) {
        router.push(ROUTES.MANAGER_DASHBOARD);
        return;
      }
    }
  }, [isAuthenticated, user, loading, router]);

  const handleLogout = () => {
    dispatch(logout());
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('maxerp_token');
      localStorage.removeItem('maxerp_user');
      deleteCookie('maxerp_token');
    }
    router.push(ROUTES.LOGIN);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== UserRole.EMPLOYEE) {
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
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Employee Dashboard
                </h1>
                <p className="text-slate-700 font-medium">
                  Welcome back, <span className="font-semibold text-indigo-600">{user.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-slate-800">{user.department}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leave Balance */}
          <div className="lg:col-span-1">
            <LeaveBalance user={user} />
          </div>

          {/* Leave Form and History */}
          <div className="lg:col-span-2 space-y-8">
            <LeaveForm />
            <LeaveHistory />
          </div>
        </div>
      </main>
    </div>
  );
}
