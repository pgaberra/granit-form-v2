// Project-local Postgres for development (no Docker needed).
// Data lives in tools/dev-db/data; connection: postgres://postgres:postgres@localhost:5442/medusa
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const dataDir = new URL("./data", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port: 5442,
  persistent: true,
  // Without this, initdb on Windows picks the system code page (WIN1252).
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (!existsSync(dataDir)) {
  await pg.initialise();
}
await pg.start();
try {
  await pg.createDatabase("medusa");
} catch {
  // already exists
}
console.log("Postgres ready on postgres://postgres:postgres@localhost:5442/medusa");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
