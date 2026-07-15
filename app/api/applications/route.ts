import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || "info@mainstreambasketball.com";

export async function POST(req: NextRequest) {
  const { opportunityId, opportunityTitle, name, email, phone, message } = await req.json();

  if (!opportunityTitle || !name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const record = {
    id: `app_${Date.now()}`,
    opportunity_id: opportunityId || null,
    opportunity_title: opportunityTitle,
    name,
    email,
    phone: phone || null,
    message: message || null,
  };

  // Log it, but don't let a DB hiccup block the email from sending.
  const { error: dbError } = await supabase.from("applications").insert(record);
  if (dbError) console.error("Supabase insert error:", dbError);

  try {
    await resend.emails.send({
      from: "Mainstream Basketball Club <hello@mainstreambasketball.com>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `New response: ${opportunityTitle} — ${name}`,
      text: `Opportunity: ${opportunityTitle}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\n\nMessage:\n${message || "—"}`,
    });
  } catch (err) {
    console.error("Resend error:", err);
    // The submission is already saved in Supabase even if the email fails,
    // so don't tell the person it failed.
  }

  return NextResponse.json({ ok: true });
}
