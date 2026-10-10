import { seedPeople, seedVolunteers } from "./seed";
import type { Person, Volunteer } from "./data";

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
export const PERSISTENT = Boolean(URL_ && TOKEN);

export interface State {
  people: Person[];
  volunteers: Volunteer[];
  helped: number;
  v: number;
  persistent: boolean;
}

/* ---------- Xotira (demo) rejimi ---------- */
type Mem = { people: Map<string, Person>; vols: Map<string, Volunteer>; photos: Map<string, string>; helped: number; v: number };
const g = globalThis as unknown as { __mehr?: Mem };
function mem(): Mem {
  if (!g.__mehr) {
    const now = Date.now();
    g.__mehr = {
      people: new Map(seedPeople(now).map((p) => [p.id, p])),
      vols: new Map(seedVolunteers(now).map((p) => [p.id, p])),
      photos: new Map(),
      helped: 124,
      v: 1,
    };
  }
  return g.__mehr;
}

/* ---------- Upstash Redis (REST) ---------- */
async function redis(cmds: (string | number)[][]): Promise<any[]> {
  const r = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("redis " + r.status);
  const j = await r.json();
  return j.map((x: any) => x.result);
}
function hashToList<T>(flat: string[] | null): T[] {
  const out: T[] = [];
  if (!flat) return out;
  for (let i = 1; i < flat.length; i += 2) {
    try { out.push(JSON.parse(flat[i])); } catch {}
  }
  return out;
}
async function ensureSeed() {
  const [seeded] = await redis([["GET", "mehr:seeded"]]);
  if (seeded) return;
  const now = Date.now();
  const cmds: (string | number)[][] = [];
  for (const p of seedPeople(now)) cmds.push(["HSET", "mehr:people", p.id, JSON.stringify(p)]);
  for (const v of seedVolunteers(now)) cmds.push(["HSET", "mehr:vols", v.id, JSON.stringify(v)]);
  cmds.push(["SET", "mehr:helped", 124], ["SET", "mehr:v", 1], ["SET", "mehr:seeded", 1]);
  await redis(cmds);
}

/* ---------- Umumiy API ---------- */
export async function getVersion(): Promise<number> {
  if (!PERSISTENT) return mem().v;
  try {
    const [v] = await redis([["GET", "mehr:v"]]);
    return Number(v || 1);
  } catch (e) {
    console.error("[mehr] redis version xato:", e);
    return mem().v;
  }
}

export async function getState(): Promise<State> {
  const memState = (): State => {
    const m = mem();
    return { people: [...m.people.values()], volunteers: [...m.vols.values()], helped: m.helped, v: m.v, persistent: false };
  };
  if (!PERSISTENT) return memState();
  try {
    await ensureSeed();
    const [ph, vh, helped, v] = await redis([["HGETALL", "mehr:people"], ["HGETALL", "mehr:vols"], ["GET", "mehr:helped"], ["GET", "mehr:v"]]);
    return {
      people: hashToList<Person>(ph),
      volunteers: hashToList<Volunteer>(vh),
      helped: Number(helped || 0),
      v: Number(v || 1),
      persistent: true,
    };
  } catch (e) {
    // Redis ishlamasa ham sayt ochilsin: xotira rejimiga tushamiz
    console.error("[mehr] redis state xato:", e);
    return memState();
  }
}

export async function getPerson(id: string): Promise<Person | null> {
  if (!PERSISTENT) return mem().people.get(id) ?? null;
  await ensureSeed();
  const [r] = await redis([["HGET", "mehr:people", id]]);
  try { return r ? JSON.parse(r) : null; } catch { return null; }
}

export async function putPerson(p: Person, helpedDelta = 0) {
  if (!PERSISTENT) {
    const m = mem(); m.people.set(p.id, p); m.helped += helpedDelta; m.v++; return;
  }
  await ensureSeed();
  const cmds: (string | number)[][] = [["HSET", "mehr:people", p.id, JSON.stringify(p)], ["INCR", "mehr:v"]];
  if (helpedDelta) cmds.push(["INCRBY", "mehr:helped", helpedDelta]);
  await redis(cmds);
}

export async function removePerson(id: string) {
  if (!PERSISTENT) { const m = mem(); m.people.delete(id); m.photos.delete(id); m.v++; return; }
  await redis([["HDEL", "mehr:people", id], ["DEL", "mehr:photo:" + id], ["INCR", "mehr:v"]]);
}

export async function putVolunteer(v: Volunteer) {
  if (!PERSISTENT) { const m = mem(); m.vols.set(v.id, v); m.v++; return; }
  await ensureSeed();
  await redis([["HSET", "mehr:vols", v.id, JSON.stringify(v)], ["INCR", "mehr:v"]]);
}

export async function removeVolunteer(id: string) {
  if (!PERSISTENT) { const m = mem(); m.vols.delete(id); m.photos.delete(id); m.v++; return; }
  await redis([["HDEL", "mehr:vols", id], ["DEL", "mehr:photo:" + id], ["INCR", "mehr:v"]]);
}

export async function savePhoto(id: string, dataUrl: string) {
  if (!PERSISTENT) { mem().photos.set(id, dataUrl); return; }
  await redis([["SET", "mehr:photo:" + id, dataUrl]]);
}

export async function loadPhoto(id: string): Promise<string | null> {
  if (!PERSISTENT) return mem().photos.get(id) ?? null;
  const [r] = await redis([["GET", "mehr:photo:" + id]]);
  return r ?? null;
}
