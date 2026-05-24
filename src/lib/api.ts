const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  // Try to get token from options first, then from localStorage
  let token = options.token;
  if (!token) {
    try {
      const auth = localStorage.getItem('skilldna_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        token = parsed.token;
      }
    } catch {
      // Silently ignore parsing errors
    }
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
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

export { API_BASE_URL };
