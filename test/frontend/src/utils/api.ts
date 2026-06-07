const BASE_URL = 'http://localhost:5000/api';

export interface APIResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  token?: string;
  user?: any;
  errors?: Array<{ field: string; message: string }>;
}

export class APIError extends Error {
  status: string;
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;

  constructor(message: string, status: string, statusCode: number, errors?: any) {
    super(message);
    this.status = status;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<APIResponse<T>> {
  const token = localStorage.getItem('store_rating_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = (await response.json().catch(() => ({}))) as APIResponse<T>;

  if (!response.ok) {
    // Check for 401 Unauthorized to auto-logout/redirect
    if (response.status === 401) {
      localStorage.removeItem('store_rating_token');
      localStorage.removeItem('store_rating_user');
      // If we are not on the login page, redirect
      if (!window.location.pathname.endsWith('/login') && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    throw new APIError(
      data.message || 'Something went wrong',
      data.status || 'error',
      response.status,
      data.errors
    );
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, 'GET'),
  post: <T = any>(endpoint: string, body: any) => request<T>(endpoint, 'POST', body),
  put: <T = any>(endpoint: string, body: any) => request<T>(endpoint, 'PUT', body),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, 'DELETE'),
};
