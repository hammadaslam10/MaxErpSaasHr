'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setAuth, setLoading } from '@/redux/slices/authSlice';
import { UserRole } from '@/types';
import { ROUTES } from '@/constants';
import { getCookie } from 'cookies-next';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('maxerp_token') || getCookie('maxerp_token');
      const userStr = localStorage.getItem('maxerp_user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          dispatch(setAuth({ user, token }));
        } catch (error) {
          // Clear invalid data
          localStorage.removeItem('maxerp_token');
          localStorage.removeItem('maxerp_user');
          dispatch(setLoading(false));
        }
      } else {
        dispatch(setLoading(false));
      }
    } else {
      
      const token = getCookie('maxerp_token');
      if (token) {
        
        dispatch(setLoading(false));
      } else {
        dispatch(setLoading(false));
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        
        if (user.role === UserRole.MANAGER) {
          router.push(ROUTES.MANAGER_DASHBOARD);
        } else {
          router.push(ROUTES.DASHBOARD);
        }
      } else {
        
        router.push(ROUTES.LOGIN);
      }
    }
  }, [isAuthenticated, user, loading, router]);

  
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

  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          MaxERP Leave Management System
        </h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}