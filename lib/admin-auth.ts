import { cookies } from "next/headers";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "vietdragon2026@admin";
const SESSION_COOKIE_NAME = "vd_admin_session";
const SESSION_SECRET_TOKEN = "vd_sec_token_98374291873912873";

export interface AdminSession {
  authenticated: boolean;
  username: string;
}

export async function verifyAdminCredentials(username: string, pass: string): Promise<boolean> {
  return username.trim() === ADMIN_USERNAME && pass.trim() === ADMIN_PASSWORD;
}

export async function createAdminSession(username: string) {
  const cookieStore = await cookies();
  const value = `${username}:${SESSION_SECRET_TOKEN}:${Date.now()}`;
  const base64 = Buffer.from(value).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, base64, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return { authenticated: false, username: "" };
  }

  try {
    const raw = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
    const [username, token] = raw.split(":");
    if (token === SESSION_SECRET_TOKEN && username === ADMIN_USERNAME) {
      return { authenticated: true, username };
    }
  } catch {
    // Invalid token format
  }

  return { authenticated: false, username: "" };
}
