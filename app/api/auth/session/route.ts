import { AppError } from "@/lib/server/AppError";
import { getSessionUser } from "@/lib/server/auth.server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getSessionUser();

    return NextResponse.json(user);
  } catch (error) {
    const err = AppError.create(`${error}`, 500, false);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode }
    );
  }
}
