import { API_BASE_URL } from '@/constants';

interface ConvertURIOptions {
  baseURI: 'api' | 'authenticationAPI';
  params?: Record<string, string | number>;
  query?: Record<string, string | number>;
}

export const convertURI = (uri: string, options: ConvertURIOptions): string => {
  const { baseURI, params, query } = options;
  
  let baseUrl = API_BASE_URL;
  
  let finalUri = uri;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      finalUri = finalUri.replace(`:${key}`, String(value));
    });
  }
  
  
  if (query) {
    const queryString = new URLSearchParams(
      Object.entries(query).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    
    if (queryString) {
      finalUri += `?${queryString}`;
    }
  }
  
  return `${baseUrl}${finalUri}`;
};
