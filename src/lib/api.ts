export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit & { tenantId?: string }
): Promise<ApiResponse<T>> {
  const { tenantId, ...fetchOptions } = options ?? {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };
  if (tenantId) headers['x-tenant-id'] = tenantId;

  const res = await fetch(url, { ...fetchOptions, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export function apiSuccess<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return { data, meta };
}

export function apiError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ data: null, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
