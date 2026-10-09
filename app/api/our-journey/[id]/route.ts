import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSessionFromRequest } from "@/lib/auth";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = await req.json();
  const allowed = ["category_id", "title", "description", "images", "links", "published", "sort_order"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) if (body[key] !== undefined) update[key] = body[key];
  update.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from("our_journey_entries").update(update).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!getSessionFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const { error } = await supabase.from("our_journey_entries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
