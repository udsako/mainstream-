import { NextRequest, NextResponse } from "next/server";
import { getAll, add } from "@/lib/db";
import { Opportunity } from "@/lib/opportunities";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  const opportunities = await getAll();
  return NextResponse.json(opportunities);
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, category, venue, description, deadline, keepVisibleAfterDeadline } = body;

  if (!title || !category || !venue || !description || !deadline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const opportunity: Opportunity = {
    id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    title,
    category,
    venue,
    description,
    deadline,
    keepVisibleAfterDeadline: !!keepVisibleAfterDeadline,
  };

  await add(opportunity);
  return NextResponse.json(opportunity, { status: 201 });
}
