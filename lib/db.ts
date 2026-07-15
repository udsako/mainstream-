import { supabase } from "./supabase";
import { Opportunity } from "./opportunities";

function fromRow(row: any): Opportunity {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    venue: row.venue,
    description: row.description,
    deadline: row.deadline,
    keepVisibleAfterDeadline: row.keep_visible_after_deadline,
  };
}

export async function getAll(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("deadline", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map(fromRow);
}

export async function getById(id: string): Promise<Opportunity | null> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? fromRow(data) : null;
}

export async function add(opportunity: Opportunity): Promise<void> {
  const { error } = await supabase.from("opportunities").insert({
    id: opportunity.id,
    title: opportunity.title,
    category: opportunity.category,
    venue: opportunity.venue,
    description: opportunity.description,
    deadline: opportunity.deadline,
    keep_visible_after_deadline: opportunity.keepVisibleAfterDeadline ?? false,
  });
  if (error) throw new Error(error.message);
}

export async function update(id: string, updates: Partial<Opportunity>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.venue !== undefined) payload.venue = updates.venue;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.deadline !== undefined) payload.deadline = updates.deadline;
  if (updates.keepVisibleAfterDeadline !== undefined) {
    payload.keep_visible_after_deadline = updates.keepVisibleAfterDeadline;
  }

  const { error } = await supabase.from("opportunities").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
