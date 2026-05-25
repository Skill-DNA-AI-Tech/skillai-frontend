const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

type RequestOptions = RequestInit & {
  token?: string;
};

type ApiConfig = RequestOptions & {
  responseType?: 'json' | 'blob';
};

const normalizeApiPath = (path: string) => (path.startsWith('/api/') ? path.slice(4) : path);

const readStoredToken = () => {
  try {
    const auth = localStorage.getItem('skilldna_auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed.token as string | undefined;
    }
  } catch {
    // Silently ignore parsing errors
  }

  return undefined;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
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

  const { token: _token, ...fetchOptions } = options;
  const response = await fetch(`${API_BASE_URL}${normalizeApiPath(path)}`, {
    ...fetchOptions,
    headers,
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = json?.message || response.statusText || `API request failed with ${response.status}`;
    throw new Error(message);
  }

  return json as T;
}

const requestWithData = async <T>(path: string, config: ApiConfig = {}, method = 'GET'): Promise<{ data: T }> => {
  const headers = new Headers(config.headers);
  const token = config.token ?? readStoredToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = config.body instanceof FormData;
  if (!isFormData && config.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const { token: _token, responseType, ...fetchOptions } = config;
  const response = await fetch(`${API_BASE_URL}${normalizeApiPath(path)}`, {
    ...fetchOptions,
    method,
    headers,
  });

  if (!response.ok) {
    let errorBody: any = null;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { error: response.statusText };
    }

    const error = new Error(errorBody?.message || errorBody?.error || response.statusText) as Error & {
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

export { API_BASE_URL };
