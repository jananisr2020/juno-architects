export interface ApiProject {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  snapshots: Array<{ version: number; created_at: string; payload: Record<string, unknown> }>;
}
export interface AuthResult { access_token: string; token_type: string; expires_in: number }

async function request<T>(baseUrl: string, path: string, token?: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try { const body = await response.json(); if (body.detail) message = body.detail; } catch { /* response may not be JSON */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export function authenticateApi(baseUrl: string, mode: 'register' | 'login', email: string, password: string): Promise<AuthResult> {
  return request<AuthResult>(baseUrl, `/api/v1/auth/${mode}`, undefined, { method: 'POST', body: JSON.stringify({ email, password }) });
}
export function listApiProjects(baseUrl: string, token: string): Promise<ApiProject[]> { return request<ApiProject[]>(baseUrl, '/api/v1/projects', token); }
export function createApiProject(baseUrl: string, token: string, title: string, payload: Record<string, unknown>): Promise<ApiProject> {
  return request<ApiProject>(baseUrl, '/api/v1/projects', token, { method: 'POST', body: JSON.stringify({ title, payload }) });
}
export function renameApiProject(baseUrl: string, token: string, id: string, title: string): Promise<ApiProject> {
  return request<ApiProject>(baseUrl, `/api/v1/projects/${encodeURIComponent(id)}`, token, { method: 'PATCH', body: JSON.stringify({ title }) });
}
export function duplicateApiProject(baseUrl: string, token: string, id: string): Promise<ApiProject> {
  return request<ApiProject>(baseUrl, `/api/v1/projects/${encodeURIComponent(id)}/duplicate`, token, { method: 'POST' });
}
export function deleteApiProject(baseUrl: string, token: string, id: string): Promise<void> {
  return request<void>(baseUrl, `/api/v1/projects/${encodeURIComponent(id)}`, token, { method: 'DELETE' });
}
