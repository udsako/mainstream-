import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("our_journey_entries")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { category_id, title, description = "", images = [], links = [], published = true } = body;
  const allowed = ["tournament-2025", "championship-2026", "featured-tournaments", "friendlies"];
  if (!allowed.includes(category_id) || !title?.trim()) {
    return NextResponse.json({ error: "Choose a category and enter a title." }, { status: 400 });
  }
  if (!Array.isArray(images) || !Array.isArray(links)) return NextResponse.json({ error: "Images and links must be lists." }, { status: 400 });
  const id = `journey-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data, error } = await supabase.from("our_journey_entries").insert({
    id, category_id, title: title.trim(), description: String(description), images,
    links, published: Boolean(published), sort_order: Number(body.sort_order ?? 0)
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
