const TOKEN_KEY = "busbooker_token";
const NAME_KEY = "busbooker_name";
const EMAIL_KEY = "busbooker_email";

export interface User {
  id?: string;
  name: string;
  email: string;
  role?: "user" | "admin";
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): User {
  if (typeof window === "undefined") {
    return {
      name: "",
      email: "",
    };
  }
  return {
    name: localStorage.getItem(NAME_KEY) ?? "",
    email: localStorage.getItem(EMAIL_KEY) ?? "",
  };
}

export function setStoredUser(name: string, email: string, token?: string) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(EMAIL_KEY, email);
  if (token) {
    setToken(token);
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearStoredUser() {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
