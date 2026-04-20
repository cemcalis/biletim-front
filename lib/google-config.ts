export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function hasGoogleClientId(): boolean {
  return GOOGLE_CLIENT_ID.trim().length > 0;
}