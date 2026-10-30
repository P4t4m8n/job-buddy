import { randomBytes } from "node:crypto";
import { connection, NextResponse } from "next/server";
import {
  getGoogleConfig,
  GOOGLE_STATE_COOKIE,
  GOOGLE_STATE_MAX_AGE,
} from "@/lib/server/google.server";

export async function GET() {

  console.log("Starting Google redirect flow");
  await connection(); // run per request, never at build time
  const { clientId, redirectUri } = getGoogleConfig();
  const state = randomBytes(32).toString("base64url");

  const googleAuthURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthURL.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email profile",
    state,
  }).toString();

  const response = NextResponse.redirect(googleAuthURL);
  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: GOOGLE_STATE_MAX_AGE,
  });
  return response;
}
