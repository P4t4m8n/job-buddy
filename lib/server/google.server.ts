import "server-only";

export const GOOGLE_STATE_COOKIE = "google_oauth_state";
export const GOOGLE_STATE_MAX_AGE = 60 * 10;

export const getGoogleConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth environment variables are missing");
  }
  return { clientId, clientSecret, redirectUri };
};
