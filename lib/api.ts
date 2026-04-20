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
    const fallback = `${method} ${path} failed`;
    let errorMessage = fallback;
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message) && payload.message.length > 0) {
        errorMessage = payload.message.join(", ");
      } else if (typeof payload.message === "string" && payload.message.trim()) {
        errorMessage = payload.message;
      }
    } catch {
      // Ignore JSON parse errors and use fallback message.
    }
    throw new Error(errorMessage);
  }
  return (await response.json()) as T;
}
