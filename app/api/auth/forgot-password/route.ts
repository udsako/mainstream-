import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { findUserByEmail } from "@/lib/users-db";
import { createResetToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    // Return the same response whether or not the account exists.
    // This prevents the endpoint from revealing registered email addresses.
    if (user) {
      const apiKey = process.env.RESEND_API_KEY;

      if (!apiKey) {
        console.error("RESEND_API_KEY is not configured.");
        return NextResponse.json(
          { error: "Unable to send the reset email right now." },
          { status: 500 }
        );
      }

      const resend = new Resend(apiKey);
      const token = createResetToken(user.id);

      const resetUrl = new URL(
        "/reset-password",
        req.nextUrl.origin
      );
      resetUrl.searchParams.set("token", token);

      const { error } = await resend.emails.send({
        from: "Mainstream Basketball Club <hello@mainstreambasketball.com>",
        to: user.email,
        subject: "Reset your admin password",
        text: [
          `Hi ${user.name},`,
          "",
          "A request was made to reset the password for your Mainstream Basketball Club admin account.",
          "",
          "Use the link below within 30 minutes to choose a new password:",
          resetUrl.toString(),
          "",
          "If you did not request this reset, you can safely ignore this email.",
        ].join("\n"),
      });

      if (error) {
        console.error("Resend email error:", error);
        return NextResponse.json(
          { error: "Unable to send the reset email right now." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        "If an account exists for that email, a password-reset link will be sent.",
    });
  } catch (error) {
    console.error("Forgot-password error:", error);

    return NextResponse.json(
      { error: "Unable to process your request right now." },
      { status: 500 }
    );
  }
}
