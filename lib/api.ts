import { getToken } from "./session";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010/api";

type ErrorPayload = { message?: string | string[] };

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

function formatErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const maybeMessage = (payload as ErrorPayload).message;
  if (Array.isArray(maybeMessage) && maybeMessage.length > 0) {
    return maybeMessage.join(", ");
  }

  if (typeof maybeMessage === "string" && maybeMessage.trim()) {
    return maybeMessage;
  }

  return fallback;
}

async function parseJsonBody<T>(response: Response, operation: string): Promise<T> {
  const bodyText = await response.text();
  const trimmed = bodyText.trim();

  if (!trimmed) {
    return {} as T;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const snippet = trimmed.slice(0, 120).replace(/\s+/g, " ");
    throw new Error(
      `${operation} returned non-JSON response. Check NEXT_PUBLIC_API_URL (${API_BASE}). Response starts with: ${snippet}`,
    );
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const operation = `GET ${path}`;
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const fallback = `${operation} failed`;
    let errorMessage = fallback;
    try {
      const payload = await parseJsonBody<ErrorPayload>(response, operation);
      errorMessage = formatErrorMessage(payload, fallback);
    } catch {
      errorMessage = fallback;
    }
    throw new Error(errorMessage);
  }

  return await parseJsonBody<T>(response, operation);
}

export async function apiRequest<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const operation = `${method} ${path}`;
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const fallback = `${operation} failed`;
    let errorMessage = fallback;
    try {
      const payload = await parseJsonBody<ErrorPayload>(response, operation);
      errorMessage = formatErrorMessage(payload, fallback);
    } catch {
      errorMessage = fallback;
    }
    throw new Error(errorMessage);
  }

  return await parseJsonBody<T>(response, operation);
}
