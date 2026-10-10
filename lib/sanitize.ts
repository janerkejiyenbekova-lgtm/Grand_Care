import { CATEGORIES, DAYS, HELP_TYPES, REGIONS, type Category, type Day, type HelpType, type Urgency } from "./data";

export const str = (v: unknown, max = 200): string => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
export const num = (v: unknown, min: number, max: number, def: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};
export const pick = <T extends string>(v: unknown, allowed: readonly T[], def: T): T => (allowed.includes(v as T) ? (v as T) : def);
export const pickMany = <T extends string>(v: unknown, allowed: readonly T[]): T[] =>
  Array.isArray(v) ? (v.filter((x) => allowed.includes(x as T)) as T[]) : [];

export const cleanRegion = (v: unknown) => (REGIONS.find((r) => r.name === v) ? String(v) : REGIONS[0].name);
export const cleanCategory = (v: unknown): Category => pick(v, CATEGORIES, "elderly");
export const cleanUrgency = (v: unknown): Urgency => pick(v, ["high", "medium", "low"] as const, "medium");
export const cleanHelp = (v: unknown): HelpType[] => pickMany(v, HELP_TYPES);
export const cleanDays = (v: unknown): Day[] => pickMany(v, DAYS);

/** Rasm data-URL ni tekshiradi (faqat jpeg/png/webp, ~400KB gacha) */
export function cleanDataUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v)) return null;
  if (v.length > 400_000) return null;
  return v;
}

export const newId = (prefix: string) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
