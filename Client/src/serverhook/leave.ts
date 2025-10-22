'use server';

import { catchAsync } from '@/utils/catchAsync';
import { convertURI } from '@/utils/convertURI';
import { ApiResponse } from '@/types/utils';
import { CreateLeaveRequestDto, UpdateLeaveRequestDto, LeaveRequest } from '@/types';
import { getCookie } from 'cookies-next';

// Server-side fetch with authentication
const serverFetch = async (url: string, options: RequestInit = {}) => {
  const token = getCookie('maxerp_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

const actionApplyLeave = catchAsync<ApiResponse<LeaveRequest>, CreateLeaveRequestDto>(async payload => {
  if (!payload) throw new Error('Please define arguments');

  const res = await serverFetch(
    convertURI('/leave/apply', {
      baseURI: 'api',
    }),
    {
      method: 'POST',
      body: JSON.stringify(payload),
      cache: 'no-cache',
    }
  );

  const data = await res.json();

  if (res.ok && !data.error) {
    return {
      error: false,
      data: data,
      message: typeof data.message === 'string' ? data.message : 'Leave request submitted successfully',
    };
  }
  return {
    error: true,
    data: undefined,
    message: typeof data.message === 'string' ? data.message : 'Failed to submit leave request',
  };
}, 'actionApplyLeave');

const actionGetPendingRequests = catchAsync<ApiResponse<LeaveRequest[]>, void>(async () => {
  const res = await serverFetch(
    convertURI('/leave/pending', {
      baseURI: 'api',
    }),
    {
      method: 'GET',
      cache: 'no-cache',
    }
  );

  const data = await res.json();

  if (res.ok && !data.error) {
    return {
      error: false,
      data: data,
      message: typeof data.message === 'string' ? data.message : 'Pending requests retrieved successfully',
    };
  }
  return {
    error: true,
    data: undefined,
    message: typeof data.message === 'string' ? data.message : 'Failed to retrieve pending requests',
  };
}, 'actionGetPendingRequests');

const actionUpdateLeaveRequest = catchAsync<ApiResponse<LeaveRequest>, { id: string; data: UpdateLeaveRequestDto }>(async payload => {
  if (!payload) throw new Error('Please define arguments');

  const res = await serverFetch(
    convertURI(`/leave/approve/${payload.id}`, {
      baseURI: 'api',
    }),
    {
      method: 'POST',
      body: JSON.stringify(payload.data),
      cache: 'no-cache',
    }
  );

  const data = await res.json();

  if (res.ok && !data.error) {
    return {
      error: false,
      data: data,
      message: typeof data.message === 'string' ? data.message : 'Leave request updated successfully',
    };
  }
  return {
    error: true,
    data: undefined,
    message: typeof data.message === 'string' ? data.message : 'Failed to update leave request',
  };
}, 'actionUpdateLeaveRequest');

const actionGetMyRequests = catchAsync<ApiResponse<LeaveRequest[]>, void>(async () => {
  const res = await serverFetch(
    convertURI('/leave/my-requests', {
      baseURI: 'api',
    }),
    {
      method: 'GET',
      cache: 'no-cache',
    }
  );

  const data = await res.json();

  if (res.ok && !data.error) {
    return {
      error: false,
      data: data,
      message: typeof data.message === 'string' ? data.message : 'My requests retrieved successfully',
    };
  }
  return {
    error: true,
    data: undefined,
    message: typeof data.message === 'string' ? data.message : 'Failed to retrieve my requests',
  };
}, 'actionGetMyRequests');

export { actionApplyLeave, actionGetPendingRequests, actionUpdateLeaveRequest, actionGetMyRequests };
