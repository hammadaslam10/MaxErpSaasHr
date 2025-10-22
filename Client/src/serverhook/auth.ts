'use server';

import { catchAsync } from '@/utils/catchAsync';
import { convertURI } from '@/utils/convertURI';
import { ApiResponse } from '@/types/utils';
import { LoginDto, AuthResponse } from '@/types';

const actionLogin = catchAsync<ApiResponse<AuthResponse>, LoginDto>(async payload => {
  if (!payload) throw new Error('Please define arguments');

  const url = convertURI('/auth/login', {
    baseURI: 'api',
  });

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    cache: 'no-cache',
  });

  const data = await res.json();

  if (res.ok && !data.error) {
    return {
      error: false,
      data: data,
      message: typeof data.message === 'string' ? data.message : 'Login successful',
    };
  }
  return {
    error: true,
    data: undefined,
    message: typeof data.message === 'string' ? data.message : 'Login failed',
  };
}, 'actionLogin');

export default actionLogin;
