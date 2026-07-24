import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import { getSessionFromRequest } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || "info@mainstreambasketball.com";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

interface Player {
  name: string;
  email: string;
}

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const playersRaw = formData.get("players");
  const file = formData.get("receipt");

  let players: Player[];
  try {
    players = JSON.parse(String(playersRaw));
  } catch {
    return NextResponse.json({ error: "Invalid player list" }, { status: 400 });
  }

  if (!Array.isArray(players) || players.length === 0) {
    return NextResponse.json({ error: "Add at least one player" }, { status: 400 });
  }
  for (const p of players) {
    if (!p.name?.trim() || !p.email?.trim() || !p.email.includes("@")) {
      return NextResponse.json({ error: "Each player needs a name and a valid email" }, { status: 400 });
    }
  }
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Please attach your payment receipt" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 8MB)" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, WEBP, HEIC, or PDF file" }, { status: 400 });
  }

  const id = `pay_${Date.now()}`;
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${id}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(path, arrayBuffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from("receipts").getPublicUrl(path);

  const contactEmail = players[0].email;

  const { error: dbError } = await supabase.from("payments").insert({
    id,
    email: contactEmail,
    players,
    receipt_url: publicUrlData.publicUrl,
    status: "pending",
  });
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const playerList = players.map((p) => `- ${p.name} (${p.email})`).join("\n");

  try {
    await resend.emails.send({
      from: "Mainstream Basketball Club <hello@mainstreambasketball.com>",
      to: NOTIFY_EMAIL,
      replyTo: contactEmail,
      subject: `Payment submitted — ${players.length} player${players.length > 1 ? "s" : ""} (${players[0].name}${players.length > 1 ? " + others" : ""})`,
      text: `A payment receipt was just submitted for ${players.length} player(s):\n\n${playerList}\n\nReceipt: ${publicUrlData.publicUrl}\n\nReview and confirm it in the admin dashboard.`,
    });
  } catch (err) {
    console.error("Resend error:", err);
  }

  return NextResponse.json({ ok: true, id });
}