import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { findUserByEmail } from "@/lib/users-db";
import { createResetToken } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await findUserByEmail(email);

  if (user) {
    const token = createResetToken(user.id);
    const origin = req.nextUrl.origin;
    const resetUrl = `${origin}/admin/reset-password?token=${token}`;

    try {
      await resend.emails.send({
        from: "Mainstream Basketball Club <hello@mainstreambasketball.com>",
        to: user.email,
        subject: "Reset your admin password",
        text: `Hi ${user.name},\n\nA request was made for a password reset for your Mainstream Basketball Club admin account. If this was you, click the link below within 30 minutes:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
      });
    } catch (err) {
      console.error("Resend error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}