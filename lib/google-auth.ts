import { apiRequest } from "./api";
import { setStoredUser } from "./session";

export interface GoogleAuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function handleGoogleAuth(googleToken: string) {
  try {
    const response = await apiRequest<GoogleAuthResponse>("/auth/google", "POST", {
      token: googleToken,
    });

    setStoredUser(response.user.name, response.user.email, response.access_token);
    return response;
  } catch (error: any) {
    console.error("Google auth failed:", error);
    // Re-throw with the error message from backend
    throw new Error(error?.message || "Google ile giriş başarısız oldu");
  }
}