export const STAFF_NAMES = ["diyora", "janerke", "solixa", "sabina", "xadicha"];
export const STAFF_PASSWORD = "mehr";

export function checkStaff(name: string, password: string): string | null {
  const n = (name || "").trim().toLowerCase();
  if (!STAFF_NAMES.includes(n)) return null;
  if ((password || "").trim().toLowerCase() !== STAFF_PASSWORD) return null;
  return n.charAt(0).toUpperCase() + n.slice(1);
}
