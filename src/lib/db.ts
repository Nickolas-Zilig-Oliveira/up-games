import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Database } from "./types";
import { buildSeed } from "./seed";

/*
 * Banco local em JSON. Toda leitura/escrita passa por aqui, então trocar
 * por Supabase depois é questão de reimplementar `read`/`mutate`.
 */

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

type Store = { loading: Promise<Database> | null; queue: Promise<unknown> };
const g = globalThis as unknown as { __upStore?: Store };
const store: Store = (g.__upStore ??= { loading: null, queue: Promise.resolve() });

function load(): Promise<Database> {
  // Uma única carga compartilhada, mesmo com várias requisições simultâneas.
  store.loading ??= (async () => {
    try {
      return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as Database;
    } catch {
      const db = buildSeed();
      await persist(db);
      return db;
    }
  })();
  return store.loading;
}

async function persist(db: Database) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.${uid()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DB_FILE);
}

export async function read(): Promise<Database> {
  return load();
}

/** Executa uma alteração em fila, garantindo que escritas não se atropelem. */
export function mutate<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = store.queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await persist(db);
    return result;
  });
  store.queue = run.catch(() => undefined);
  return run;
}

export const uid = () => randomUUID().replace(/-/g, "").slice(0, 12);
