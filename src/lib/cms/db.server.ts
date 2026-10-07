import mysql, { type RowDataPacket } from "mysql2/promise";
let pool: mysql.Pool | undefined;
export const cmsEnabled = () => process.env["CMS_ENABLED"] === "true";
export function database() {
  if (!process.env["DB_NAME"] || !process.env["DB_USER"])
    throw new Error("MySQL is not configured. Follow CMS-SETUP.md.");
  return (pool ??= mysql.createPool({
    host: process.env["DB_HOST"] || "127.0.0.1",
    port: Number(process.env["DB_PORT"] || 3306),
    database: process.env["DB_NAME"],
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"] || "",
    connectionLimit: 5,
    timezone: "Z",
    dateStrings: true,
    charset: "utf8mb4",
    ...(process.env["DB_SSL"] === "true" ? { ssl: { rejectUnauthorized: true } } : {}),
  }));
}
export async function rows<T = Record<string, unknown>>(
  sql: string,
  values: (string | number | boolean | null)[] = [],
): Promise<T[]> {
  const [result] = await database().execute<RowDataPacket[]>(sql, values);
  return result as T[];
}
export function json<T>(value: unknown): T {
  return (typeof value === "string" ? JSON.parse(value) : value) as T;
}
