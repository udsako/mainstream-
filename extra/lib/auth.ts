import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me";
const COOKIE_NAME = "mainstream_admin_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(userId: string, expiresIn: jwt.SignOptions["expiresIn"] = "7d"): string {
  return jwt.sign({ userId }, SECRET, { expiresIn });
}

export function verifySessionToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): { userId: string } | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// Short-lived, single-purpose token for the "forgot password" email link.
export function createResetToken(userId: string): string {
  return jwt.sign({ userId, purpose: "password-reset" }, SECRET, { expiresIn: "30m" });
}

export function verifyResetToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { userId: string; purpose: string };
    if (decoded.purpose !== "password-reset") return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };