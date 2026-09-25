const AUTHORITATIVE_FASTAPI_URL = 'https://skillai-backend.onrender.com/api';
const AUTHORITATIVE_EXPRESS_URL = 'https://skilldna-backend.onrender.com/api';

export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl && !envUrl.includes('skilldna-backend.onrender.com')) {
    return envUrl.replace(/\/+$/, '');
  }
  // Authoritative Render Backend for production hosting
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return AUTHORITATIVE_FASTAPI_URL;
  }
  // Local fallback
  return 'http://localhost:8001/api';
};

export const getAuthApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_AUTH_API_URL || '').trim();
  if (envUrl && !envUrl.includes('skilldna-backend.onrender.com')) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return AUTHORITATIVE_FASTAPI_URL;
  }
  return 'http://localhost:8001/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const AUTH_API_BASE_URL = getAuthApiBaseUrl();

export const getBaseUrlForPath = (_path: string): string => {
  return getApiBaseUrl();
};

export const formatApiError = (err: any): string => {
  if (!err) return 'An unexpected error occurred.';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  return 'Operation failed. Please try again.';
};

type RequestOptions = RequestInit & {
  token?: string;
};

type ApiConfig = RequestOptions & {
  responseType?: 'json' | 'blob';
};

const normalizeApiPath = (path: string) => {
  let clean = path;
  if (clean.startsWith('/api/')) {
    clean = clean.slice(4);
  } else if (clean.startsWith('api/')) {
    clean = clean.slice(3);
  }
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }
  return clean;
};
const STORAGE_KEY = 'skilldna_auth';

export const readStoredToken = () => {
  try {
    const auth = localStorage.getItem(STORAGE_KEY);
    if (auth) {
      const parsed = JSON.parse(auth);
      if (parsed?.token) return parsed.token as string;
      if (parsed?.access_token) return parsed.access_token as string;
    }
  } catch {
    // Silently ignore parsing errors
  }

  try {
    const direct = localStorage.getItem('token') || localStorage.getItem('admin_token') || localStorage.getItem('admin_backup_token') || localStorage.getItem('access_token');
    if (direct) return direct;
  } catch {
    // Ignore
  }

  return undefined;
};

const readStoredRefreshToken = () => {
  try {
    const auth = localStorage.getItem(STORAGE_KEY);
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed.refreshToken as string | undefined;
    }
  } catch {
    // Silently ignore parsing errors
  }

  return undefined;
};

const refreshAccessToken = async () => {
  const refreshToken = readStoredRefreshToken();
  if (!refreshToken) return undefined;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }

  const nextAuth = await response.json();
  const saved = localStorage.getItem(STORAGE_KEY);
  const parsed = saved ? JSON.parse(saved) : {};
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...parsed,
    user: nextAuth,
    token: nextAuth.token,
    refreshToken: nextAuth.refreshToken ?? refreshToken,
  }));

  return nextAuth.token as string | undefined;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}, retryOnUnauthorized = true): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Try to get token from options first, then from localStorage
  let token = options.token;
  if (!token) {
    token = readStoredToken();
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const cleanPath = normalizeApiPath(path);
  const baseUrl = getBaseUrlForPath(cleanPath);
  const method = (options.method || 'GET').toUpperCase();

  const { token: _token, ...fetchOptions } = options;
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${cleanPath}`, {
      ...fetchOptions,
      headers,
    });
  } catch (netErr) {
    // If primary network request fails, failover to alternate backend immediately
    const altBase = baseUrl.includes('skillai-backend') ? AUTHORITATIVE_EXPRESS_URL : AUTHORITATIVE_FASTAPI_URL;
    try {
      response = await fetch(`${altBase}${cleanPath}`, {
        ...fetchOptions,
        headers,
      });
    } catch {
      throw netErr;
    }
  }

  // If primary returned 404 or 500, automatically retry on authoritative backend!
  if (response.status === 404 || response.status === 500) {
    if (baseUrl !== AUTHORITATIVE_FASTAPI_URL) {
      try {
        const altResponse = await fetch(`${AUTHORITATIVE_FASTAPI_URL}${cleanPath}`, {
          ...fetchOptions,
          headers,
        });
        if (altResponse.ok) {
          response = altResponse;
        }
      } catch {
        // preserve original response
      }
    }
  }

  const text = await response.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!response.ok) {
    if (response.status === 401 && retryOnUnauthorized) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        return apiRequest<T>(path, { ...options, token: refreshedToken }, false);
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        if (window.location.pathname !== '/' && window.location.pathname !== '/auth') {
          window.location.href = '/';
          return {} as T;
        }
      }
    }

    let rawMsg = json?.message || json?.detail || json?.error;
    if (!rawMsg && json && typeof json === 'object') {
      if (Array.isArray(json.detail)) {
        rawMsg = json.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      }
    }

    let message = rawMsg || response.statusText;
    if (response.status === 404) {
      message = `[${method} ${cleanPath}] Route not found (404). Please ensure the application backend is reachable.`;
    } else if (!message) {
      message = `[${method} ${cleanPath}] API request failed with ${response.status}`;
    }
    throw new Error(message);
  }

  return json as T;
}

const requestWithData = async <T>(path: string, config: ApiConfig = {}, method = 'GET', retryOnUnauthorized = true): Promise<{ data: T }> => {
  const headers = new Headers(config.headers);
  const token = config.token ?? readStoredToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = config.body instanceof FormData;
  if (!isFormData && config.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const cleanPath = normalizeApiPath(path);
  const baseUrl = getBaseUrlForPath(cleanPath);
  const httpMethod = method.toUpperCase();

  const { token: _token, responseType, ...fetchOptions } = config;
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${cleanPath}`, {
      ...fetchOptions,
      method,
      headers,
    });
  } catch (netErr) {
    const altBase = baseUrl.includes('skillai-backend') ? AUTHORITATIVE_EXPRESS_URL : AUTHORITATIVE_FASTAPI_URL;
    try {
      response = await fetch(`${altBase}${cleanPath}`, {
        ...fetchOptions,
        method,
        headers,
      });
    } catch {
      throw netErr;
    }
  }

  // If primary returned 404, automatically retry on alternate backend!
  if (response.status === 404) {
    const altBase = baseUrl.includes('skillai-backend') ? AUTHORITATIVE_EXPRESS_URL : AUTHORITATIVE_FASTAPI_URL;
    if (altBase !== baseUrl) {
      try {
        const altResponse = await fetch(`${altBase}${cleanPath}`, {
          ...fetchOptions,
          method,
          headers,
        });
        if (altResponse.ok) {
          response = altResponse;
        }
      } catch {
        // preserve original response
      }
    }
  }

  if (!response.ok) {
    if (response.status === 401 && retryOnUnauthorized) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        return requestWithData<T>(path, { ...config, token: refreshedToken }, method, false);
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        if (window.location.pathname !== '/' && window.location.pathname !== '/auth') {
          window.location.href = '/';
          return { data: {} as T };
        }
      }
    }

    let errorBody: any = null;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { error: response.statusText };
    }

    let errDetail = errorBody?.message || errorBody?.detail || errorBody?.error || response.statusText;
    if (!errDetail && errorBody && typeof errorBody === 'object' && Array.isArray(errorBody.detail)) {
      errDetail = errorBody.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
    }
    if (response.status === 404) {
      errDetail = `[${httpMethod} ${cleanPath}] Route not found (404) on backend service.`;
    }

    const finalMessage = errDetail || `[${httpMethod} ${cleanPath}] Request failed with status ${response.status}`;
    const error = new Error(finalMessage) as Error & {
      response?: { data: any; status: number };
    };
    error.response = { data: errorBody, status: response.status };
    throw error;
  }

  const data = responseType === 'blob' ? await response.blob() : await response.json();
  return { data: data as T };
};

export const api = {
  get: <T = any>(path: string, config?: ApiConfig) => requestWithData<T>(path, config, 'GET'),
  post: <T = any>(path: string, body?: unknown, config: ApiConfig = {}) =>
    requestWithData<T>(
      path,
      {
        ...config,
        body: body instanceof FormData || typeof body === 'string' ? body : JSON.stringify(body ?? {}),
      },
      'POST',
    ),
  put: <T = any>(path: string, body?: unknown, config: ApiConfig = {}) =>
    requestWithData<T>(
      path,
      {
        ...config,
        body: body instanceof FormData || typeof body === 'string' ? body : JSON.stringify(body ?? {}),
      },
      'PUT',
    ),
  patch: <T = any>(path: string, body?: unknown, config: ApiConfig = {}) =>
    requestWithData<T>(
      path,
      {
        ...config,
        body: body instanceof FormData || typeof body === 'string' ? body : JSON.stringify(body ?? {}),
      },
      'PATCH',
    ),
  delete: <T = any>(path: string, config?: ApiConfig) => requestWithData<T>(path, config, 'DELETE'),
};
