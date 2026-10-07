import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import { database, rows } from "./db.server";
const scrypt = promisify(scryptCallback);
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, encoded: string) {
  const [salt, hash] = encoded.split(":");
  if (!salt || !hash) return false;
  const key = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}
export function digest(value: string) {
  const secret = process.env["SESSION_SECRET"];
  if (!secret || secret.length < 32)
    throw new Error("Configure a SESSION_SECRET of at least 32 characters.");
  return createHmac("sha256", secret).update(value).digest("hex");
}
export const cookieName = "webakoof_admin";
export function cookieToken(request: Request) {
  return (
    request.headers
      .get("cookie")
      ?.split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1) || ""
  );
}
export type Admin = { id: number; name: string; email: string };
export async function currentAdmin(request: Request): Promise<Admin | null> {
  const token = cookieToken(request);
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  return (
    (
      await rows<Admin>(
        "SELECT a.id,a.name,a.email FROM admins a JOIN admin_sessions s ON s.admin_id=a.id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()",
        [digest(token)],
      )
    )[0] || null
  );
}
export async function requireAdmin(request: Request) {
  const admin = await currentAdmin(request);
  if (!admin) throw new HttpError(401, "Please sign in to continue.");
  return admin;
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function sameOrigin(request: Request) {
  const expected = new URL(process.env["APP_ORIGIN"] || request.url);
  const origin = request.headers.get("origin");
  if (origin === expected.origin) return;
  // Local development can be opened through either loopback hostname.
  if (process.env["NODE_ENV"] !== "production" && origin) {
    try {
      const actual = new URL(origin);
      const target = new URL(request.url);
      const loopback = (hostname: string) => ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
      if (
        loopback(expected.hostname) &&
        loopback(actual.hostname) &&
        loopback(target.hostname) &&
        actual.protocol === expected.protocol &&
        actual.port === expected.port &&
        target.protocol === actual.protocol &&
        target.port === actual.port
      )
        return;
    } catch {
      /* Reject malformed origins below. */
    }
  }
  throw new HttpError(403, "This request is not allowed.");
}
export async function rateLimit(key: string, limit: number, seconds: number) {
  const bucket = digest(key);
  await database().execute(
    "INSERT INTO rate_limits(bucket, attempts, expires_at) VALUES (?,1,DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND)) ON DUPLICATE KEY UPDATE attempts=IF(expires_at<UTC_TIMESTAMP(),1,attempts+1), expires_at=IF(expires_at<UTC_TIMESTAMP(),VALUES(expires_at),expires_at)",
    [bucket, seconds],
  );
  const value = (
    await rows<{ attempts: number }>("SELECT attempts FROM rate_limits WHERE bucket=?", [bucket])
  )[0];
  if (value && value.attempts > limit)
    throw new HttpError(429, "Too many attempts. Please try again later.");
}
export function sessionCookie(token: string, seconds?: number) {
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict${process.env["NODE_ENV"] === "production" ? "; Secure" : ""}${seconds !== undefined ? `; Max-Age=${seconds}` : ""}`;
}
