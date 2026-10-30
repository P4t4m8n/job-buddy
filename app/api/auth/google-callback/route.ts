import { createSession, upsertGoogleUser } from "@/lib/server/auth.server";
import {
  getGoogleConfig,
  GOOGLE_STATE_COOKIE,
} from "@/lib/server/google.server";
import { NextResponse, NextRequest } from "next/server";

const loginError = (req: NextRequest) => {
  const url = new URL("/login", req.url);
  url.searchParams.set("error", "login_failed");
  return NextResponse.redirect(url);
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get(GOOGLE_STATE_COOKIE)?.value;

  // Reject logins that this browser did not start (login CSRF)
  if (!code || !state || !savedState || state !== savedState) {
    const response = loginError(req);
    response.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth" });
    return response;
  }

  try {
    const accessToken = await fetchTokenResponse(code);

    const userInfo = await fetchUserInfo(accessToken);

    const user = await upsertGoogleUser({
      googleId: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      picture: userInfo.picture,
    });

    await createSession(user.id);
    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    console.log("User logged in successfully");
    response.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth" });
    return response;
  } catch (error) {
    console.error("Google callback failed", error);
    const response = loginError(req);
    response.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth" });
    return response;
  }
}

const fetchTokenResponse = async function (code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });
  if (!tokenResponse.ok) throw new Error("Failed to fetch access token");
  const { access_token: accessToken } = await tokenResponse.json();
  if (!accessToken) throw new Error("Missing access token");
  return accessToken;
};

const fetchUserInfo = async function (accessToken: string) {
  const userInfoResponse = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!userInfoResponse.ok) throw new Error("Failed to fetch user info");
  const userInfo = await userInfoResponse.json();
  if (!userInfo.verified_email) throw new Error("Google email not verified");
  return userInfo;
};
