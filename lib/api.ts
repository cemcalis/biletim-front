import { getToken } from "./session";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010/api";

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed`);
  }
  return (await response.json()) as T;
}

export async function apiRequest<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} failed`);
  }
  return (await response.json()) as T;
}
