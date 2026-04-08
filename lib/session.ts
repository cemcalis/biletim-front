const NAME_KEY = "busbooker_name";
const EMAIL_KEY = "busbooker_email";

export function getStoredUser() {
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

export function setStoredUser(name: string, email: string) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearStoredUser() {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
