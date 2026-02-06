import { ApiResponse, ApiErrorResponse, AuthResponse } from '@jurix/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

class ApiError extends Error {
  code: string;
  details?: Record<string, string[]>;

  constructor(response: ApiErrorResponse) {
    super(response.error.message);
    this.name = 'ApiError';
    this.code = response.error.code;
    this.details = response.error.details;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new ApiError(data as ApiErrorResponse);
  }

  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  refresh: (refreshToken: string) =>
    request<ApiResponse<AuthResponse>>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),

  logout: (token: string) =>
    request<ApiResponse<null>>('/auth/logout', {
      method: 'POST',
      token,
    }),
};

export function createAuthenticatedApi(getToken: () => string | null) {
  return {
    get: <T>(endpoint: string) => {
      const token = getToken();
      if (!token) throw new Error('Não autenticado');
      return request<T>(endpoint, { token });
    },

    post: <T>(endpoint: string, body: unknown) => {
      const token = getToken();
      if (!token) throw new Error('Não autenticado');
      return request<T>(endpoint, { method: 'POST', body, token });
    },

    put: <T>(endpoint: string, body: unknown) => {
      const token = getToken();
      if (!token) throw new Error('Não autenticado');
      return request<T>(endpoint, { method: 'PUT', body, token });
    },

    delete: <T>(endpoint: string) => {
      const token = getToken();
      if (!token) throw new Error('Não autenticado');
      return request<T>(endpoint, { method: 'DELETE', token });
    },
  };
}

export { ApiError };
