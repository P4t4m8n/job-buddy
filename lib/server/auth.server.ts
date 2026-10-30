import "server-only";
import { createHmac } from "node:crypto";
import { prisma } from "@/prisma/prisma";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppError } from "./AppError";
import { SESSION_COOKIE as COOKIE } from "@/consts/session";

const MAX_AGE = 60 * 60 * 24; // 1 day

const getKey = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set (32+ characters)");
  }
  return new TextEncoder().encode(secret);
};

interface IGoogleUserDTO {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
  googleId: string;
}

export const upsertGoogleUser = (user: IGoogleUserDTO) => {
  const { email, googleId, firstName, lastName, picture } = user;
  if (!email || !googleId) {
    throw new Error("missing credentials");
  }

  const googleIdHash = hashGoogleId(googleId);
  const data = {
    email,
    firstName: firstName ?? null,
    lastName: lastName ?? null,
    image: picture ?? null,
  };

  return prisma.user.upsert({
    where: { googleIdHash },
    create: { googleIdHash, ...data },
    update: data,
  });
};

const hashGoogleId = (googleId: string) => {
  const secret = process.env.GOOGLE_ID_HASH_SECRET;
  if (!secret) throw new Error("GOOGLE_ID_HASH_SECRET is not set");
  return createHmac("sha256", secret).update(googleId).digest("hex");
};

export async function createSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getKey());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export const signOut = async (): Promise<void> => {
  try {
    const _cookies = await cookies();

    _cookies.set(COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      expires: new Date(0),
    });
  } catch (error) {
    throw AppError.create(`${error}`, 401, false);
  }
};

const getUserId = async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    return payload.sub ?? null;
  } catch {
    return null; // invalid or expired
  }
};

export const getSessionUser = async () => {
  const id = await getUserId();
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      image: true,
    },
  });
};

export const requireUser = async () => {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
};
