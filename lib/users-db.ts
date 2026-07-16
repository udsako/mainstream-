import { supabase } from "./supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

function fromRow(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw new Error(error.message);
  return (data || []).map(fromRow);
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("email", email)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? fromRow(data) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? fromRow(data) : undefined;
}

export async function createUser(user: User): Promise<void> {
  const { error } = await supabase.from("users").insert({
    id: user.id,
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    created_at: user.createdAt,
  });
  if (error) throw new Error(error.message);
}

export async function updatePassword(id: string, passwordHash: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", id);
  if (error) throw new Error(error.message);
}