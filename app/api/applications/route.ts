import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import { getSessionFromRequest } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || "info@mainstreambasketball.com";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const { opportunityId, opportunityTitle, registrationType, name, email, phone, message } = await req.json();

  if (!opportunityTitle || !name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Block a second "player" registration for the same opportunity + email.
  if (opportunityId && registrationType === "player") {
    const { data: existing, error: lookupError } = await supabase
      .from("applications")
      .select("id")
      .eq("opportunity_id", opportunityId)
      .eq("registration_type", "player")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      console.error("Supabase duplicate-check error:", lookupError);
    }

    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered as a player for this event." },
        { status: 409 }
      );
    }
  }

  const record = {
    id: `app_${Date.now()}`,
    opportunity_id: opportunityId || null,
    opportunity_title: opportunityTitle,
    registration_type: registrationType || null,
    name,
    email: normalizedEmail,
    phone: phone || null,
    message: message || null,
  };

  const { error: dbError } = await supabase.from("applications").insert(record);
  if (dbError) {
    console.error("Supabase insert error:", dbError);
    return NextResponse.json({ error: "Failed to save registration" }, { status: 500 });
  }

  const typeLine = registrationType
    ? `Registering as: ${registrationType === "viewer" ? "Spectator (attending to watch)" : "Participant (competing)"}\n`
    : "";

  try {
    await resend.emails.send({
      from: "Mainstream Basketball Club <hello@mainstreambasketball.com>",
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `New response: ${opportunityTitle} — ${name}`,
      text: `Opportunity: ${opportunityTitle}\n${typeLine}Name: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\n\nMessage:\n${message || "—"}`,
    });
  } catch (err) {
    console.error("Resend error:", err);
  }

  return NextResponse.json({ ok: true });
}