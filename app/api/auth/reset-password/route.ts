import { NextRequest, NextResponse } from "next/server";
import { hashPassword, verifyResetToken } from "@/lib/auth";
import { updatePassword } from "@/lib/users-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const token =
      typeof body.token === "string" ? body.token.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!token || !password) {
      return NextResponse.json(
        { error: "Reset token and new password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Your password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const resetSession = verifyResetToken(token);

    if (!resetSession) {
      return NextResponse.json(
        {
          error:
            "This password-reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await updatePassword(resetSession.userId, passwordHash);

    return NextResponse.json({
      ok: true,
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error("Password reset error:", error);

    return NextResponse.json(
      { error: "Unable to reset your password right now. Please try again." },
      { status: 500 }
    );
  }
}
