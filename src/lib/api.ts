import { supabase } from '@/lib/supabase';

export class ApiError extends Error {
  readonly status: number;
  constructor(
    status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

/**
 * Authenticated fetch wrapper for the PropDeals API.
 *
 * - Prepends `VITE_API_BASE_URL` to `path`
 * - Injects the current Supabase JWT as `Authorization: Bearer <token>`
 * - Throws `ApiError` on auth failure or non-2xx responses
 * - Returns `undefined` for 204 No Content responses
 */
export async function apiRequest<T = void>(
  path: string,
  { method = 'GET', body, headers = {} }: RequestOptions = {},
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new ApiError(401, 'Not authenticated');

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const err = await res.json();
      if (err?.message) message = err.message;
    } catch {
      // ignore — server didn't return a JSON error body
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
