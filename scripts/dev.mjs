import { spawn } from "node:child_process";
import { existsSync, openSync, closeSync } from "node:fs";
import { resolve } from "node:path";
import { createConnection } from "node:net";
import mysql from "mysql2/promise";

const host = process.env.DB_HOST || "127.0.0.1";
const port = Number(process.env.DB_PORT || 3306);
function listening() {
  return new Promise((done) => {
    const socket = createConnection({ host, port });
    const finish = (ready) => {
      socket.destroy();
      done(ready);
    };
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.setTimeout(1000, () => finish(false));
  });
}

try {
  if (process.env.CMS_ENABLED === "true") {
    const base = resolve(".local/mysql/mysql-8.4.11-winx64");
    const data = resolve(".local/mysql/data");
    const executable = resolve(base, "bin/mysqld.exe");
    if (
      !(await listening()) &&
      process.platform === "win32" &&
      host === "127.0.0.1" &&
      port === 3307 &&
      existsSync(executable) &&
      existsSync(resolve(data, "auto.cnf"))
    ) {
      console.log("Starting the existing local MySQL database...");
      const log = openSync(resolve(".local/mysql/dev.log"), "a");
      const database = spawn(
        executable,
        [
          "--no-defaults",
          `--basedir=${base}`,
          `--datadir=${data}`,
          "--port=3307",
          "--bind-address=127.0.0.1",
          "--mysqlx=0",
          "--console",
        ],
        {
          detached: true,
          windowsHide: true,
          stdio: ["ignore", log, log],
        },
      );
      closeSync(log);
      await new Promise((ready, reject) => {
        database.once("spawn", ready);
        database.once("error", reject);
      });
      database.unref();
      const deadline = Date.now() + 30000;
      while (!(await listening())) {
        if (Date.now() > deadline)
          throw new Error("Local MySQL did not start. See .local/mysql/dev.log.");
        await new Promise((ready) => setTimeout(ready, 300));
      }
    }
    const connection = await mysql.createConnection({
      host,
      port,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 5000,
      ...(process.env.DB_SSL === "true" ? { ssl: { rejectUnauthorized: true } } : {}),
    });
    try {
      await connection.query("SELECT 1");
    } finally {
      await connection.end();
    }
    console.log("CMS database ready.");
  }
  const vite = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "dev", ...process.argv.slice(2)],
    { stdio: "inherit", windowsHide: true },
  );
  vite.once("error", () => {
    console.error("Unable to start Vite.");
    process.exitCode = 1;
  });
  vite.once("exit", (code) => {
    process.exitCode = code ?? 1;
  });
} catch (error) {
  console.error(
    `CMS startup failed (${error.code || error.message}). Check the database settings in .env and CMS-SETUP.md.`,
  );
  process.exitCode = 1;
}
