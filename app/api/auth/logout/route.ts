import { AppError } from "@/lib/server/AppError";
import { signOut } from "@/lib/server/auth.server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    const err = AppError.create(`Error signing out${error}`, 500, true);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode }
    );
  }
}
