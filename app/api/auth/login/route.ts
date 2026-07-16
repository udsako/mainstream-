import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users-db";
import { verifyPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, rememberMe } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = createSessionToken(user.id, rememberMe ? "30d" : "7d");
  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email });

  const cookieOptions: Parameters<typeof res.cookies.set>[2] = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
  if (rememberMe) {
    cookieOptions.maxAge = 60 * 60 * 24 * 30;
  }

  res.cookies.set(COOKIE_NAME, token, cookieOptions);
  return res;
}