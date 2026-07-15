import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Where submitted messages get sent — set this to the club's real inbox.
const NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || "info@mainstreambasketball.com";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Mainstream Basketball Club <hello@mainstreambasketball.com>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `New message from ${name} via mainstream site`,
      text: `From: ${name} (${email})\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
