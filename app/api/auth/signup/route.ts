import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@/lib/users-db";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, email, password, inviteCode } = await req.json();

  if (!name || !email || !password || !inviteCode) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (inviteCode !== process.env.ADMIN_INVITE_CODE) {
    // Deliberately vague — don't reveal whether the code was close or wrong.
    return NextResponse.json({ error: "Invalid invite code" }, { status: 403 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const user = {
    id: `user_${Date.now()}`,
    name,
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  await createUser(user);

  const token = createSessionToken(user.id);
  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
