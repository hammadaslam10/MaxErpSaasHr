'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setAuth, setError, clearError, setLoading } from '@/redux/slices/authSlice';
import { apiClient } from '@/fetch/api';
import { UserRole } from '@/types';
import { ROUTES } from '@/constants';
import { validateEmail, validatePassword, getValidationError } from '@/utils/validation';
import { setCookie } from 'cookies-next';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, user, loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === UserRole.MANAGER) {
        router.push(ROUTES.MANAGER_DASHBOARD);
      } else {
        router.push(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear global error
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    const emailError = getValidationError('email', formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = getValidationError('password', formData.password);
    if (passwordError) errors.password = passwordError;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    dispatch(setLoading(true));
    dispatch(clearError());
    
    try {
      const response = await apiClient.post('/auth/login', formData);
      
      if (response.user && response.token) {
        dispatch(setAuth({ user: response.user, token: response.token }));
        // Store in localStorage and cookies
        if (typeof window !== 'undefined') {
          localStorage.setItem('maxerp_token', response.token);
          localStorage.setItem('maxerp_user', JSON.stringify(response.user));
          // Also store in cookies for server-side access
          setCookie('maxerp_token', response.token, { 
            maxAge: 60 * 60 * 24, // 24 hours
            httpOnly: false,
            secure: false,
            sameSite: 'lax'
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed. Please try again.';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center animate-fade-in">
          <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 animate-slide-up">
            Welcome to MaxERP
          </h2>
          <p className="text-base sm:text-lg text-slate-600 animate-slide-up animation-delay-200">
            Leave Management System
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200/50 animate-slide-up animation-delay-300">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 sm:space-y-5">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2 transition-colors duration-200 group-focus-within:text-indigo-600">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-500">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 pl-10 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base ${
                      formErrors.email 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-slate-300'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-600 text-xs sm:text-sm mt-2 animate-shake">{formErrors.email}</p>
                )}
              </div>
              
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2 transition-colors duration-200 group-focus-within:text-indigo-600">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-500">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 pl-10 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base ${
                      formErrors.password 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-slate-300'
                    }`}
                    placeholder="Enter your password"
                  />
                </div>
                {formErrors.password && (
                  <p className="text-red-600 text-xs sm:text-sm mt-2 animate-shake">{formErrors.password}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex justify-center items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span className="text-sm sm:text-base">Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm sm:text-base">Sign in</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-indigo-900">Demo Credentials</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-indigo-100">
                <p className="text-sm font-medium text-indigo-800 mb-1">👤 Employee Account</p>
                <p className="text-sm text-indigo-700 font-mono">john.doe@company.com / password123</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-100">
                <p className="text-sm font-medium text-indigo-800 mb-1">👨‍💼 Manager Account</p>
                <p className="text-sm text-indigo-700 font-mono">mike.johnson@company.com / password123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
