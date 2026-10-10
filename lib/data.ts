export type Urgency = "high" | "medium" | "low";
export type Category = "elderly" | "homeless" | "lowincome" | "disabled" | "orphan";
export type HelpType = "food" | "medicine" | "cleaning" | "company" | "repair" | "clothes" | "money";
export type Status = "new" | "verified" | "helped" | "closed";
export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Person {
  id: string;
  name: string;
  age: number;
  category: Category;
  region: string;
  district: string;
  address: string;
  phone: string; // faqat dashboard (xodimlar) ko'radi
  lat: number;
  lng: number;
  help: HelpType[];
  urgency: Urgency;
  story: string;
  photo: string; // URL yoki /api/photo/<id>
  reporter: string; // kim bildirdi
  status: Status;
  helpers: number;
  staffNote?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Volunteer {
  id: string;
  name: string;
  age: number;
  phone: string;
  region: string;
  district: string;
  days: Day[];
  skills: HelpType[];
  about: string;
  photo: string;
  createdAt: number;
}

export interface Region {
  name: string;
  lat: number;
  lng: number;
}

export const REGIONS: Region[] = [
  { name: "Toshkent shahri", lat: 41.2995, lng: 69.2401 },
  { name: "Toshkent viloyati", lat: 41.35, lng: 69.75 },
  { name: "Andijon viloyati", lat: 40.7821, lng: 72.3442 },
  { name: "Buxoro viloyati", lat: 39.7747, lng: 64.4286 },
  { name: "Farg'ona viloyati", lat: 40.3864, lng: 71.7864 },
  { name: "Jizzax viloyati", lat: 40.1158, lng: 67.8422 },
  { name: "Xorazm viloyati", lat: 41.55, lng: 60.6333 },
  { name: "Namangan viloyati", lat: 40.9983, lng: 71.6726 },
  { name: "Navoiy viloyati", lat: 40.0844, lng: 65.3792 },
  { name: "Qashqadaryo viloyati", lat: 38.8606, lng: 65.7891 },
  { name: "Samarqand viloyati", lat: 39.6542, lng: 66.9597 },
  { name: "Sirdaryo viloyati", lat: 40.4897, lng: 68.7842 },
  { name: "Surxondaryo viloyati", lat: 37.2242, lng: 67.2783 },
  { name: "Qoraqalpog'iston Respublikasi", lat: 42.4531, lng: 59.6103 },
];

export const UZ_BOUNDS: [[number, number], [number, number]] = [
  [37.0, 55.9],
  [45.6, 73.2],
];

export const DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const HELP_TYPES: HelpType[] = ["food", "medicine", "cleaning", "company", "repair", "clothes", "money"];
export const CATEGORIES: Category[] = ["elderly", "homeless", "lowincome", "disabled", "orphan"];

export const L = {
  day: {
    mon: "Dushanba", tue: "Seshanba", wed: "Chorshanba", thu: "Payshanba", fri: "Juma", sat: "Shanba", sun: "Yakshanba",
  } as Record<Day, string>,
  dayShort: {
    mon: "Du", tue: "Se", wed: "Ch", thu: "Pa", fri: "Ju", sat: "Sh", sun: "Ya",
  } as Record<Day, string>,
  help: {
    food: "Oziq-ovqat", medicine: "Dori-darmon", cleaning: "Tozalash", company: "Suhbatdosh",
    repair: "Ta'mirlash", clothes: "Kiyim-kechak", money: "Moddiy yordam",
  } as Record<HelpType, string>,
  helpIcon: {
    food: "🍞", medicine: "💊", cleaning: "🧹", company: "💬", repair: "🔧", clothes: "🧥", money: "💙",
  } as Record<HelpType, string>,
  category: {
    elderly: "Yolg'iz qariya", homeless: "Boshpanasiz", lowincome: "Kam ta'minlangan oila",
    disabled: "Nogironligi bor inson", orphan: "Yetim / parvarishsiz bola",
  } as Record<Category, string>,
  urgency: { high: "Shoshilinch", medium: "O'rtacha", low: "Past" } as Record<Urgency, string>,
  status: { new: "Yangi", verified: "Tasdiqlangan", helped: "Yordam berildi", closed: "Yopilgan" } as Record<Status, string>,
};

export const URGENCY_COLOR: Record<Urgency, string> = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "hozirgina";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} kun oldin`;
  return new Date(ts).toLocaleDateString("uz-UZ");
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
