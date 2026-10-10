# GRANDCARE — O'zbekiston bo'ylab yordam xaritasi

Next.js 15 (App Router) + Leaflet. Och ko'k, jonli (animatsiyali) dizayn. UZ/RU/EN til tanlovi, dark mode va Leaflet xaritasi uchun tile fallback mavjud.

## Ishga tushirish
```bash
npm install
npm run dev        # http://localhost:3000
```

## Vercelga qo'yish
0. **Next.js versiyasi:** Vercel zaif Next.js versiyalarini (masalan 15.5.4) bloklaydi. Loyiha `next@15.5.27` + `react@19.1.9` ga yangilangan — eski `package-lock.json` / `node_modules` ni tashlab, shu papkadagilarni ishlating.
1. Papkani GitHub'ga yuklang (yoki `vercel` buyrug'i bilan).
2. Vercel → **Add New Project** → shu repo → **Deploy** (hech narsa sozlash shart emas).
3. **Doimiy saqlash va haqiqiy real-time uchun (MUHIM):**
   Vercel loyihasi → **Storage** → **Upstash Redis (Marketplace)** → *Create* → loyihaga ulang.
   `UPSTASH_REDIS_REST_URL` va `UPSTASH_REDIS_REST_TOKEN` avtomatik qo'shiladi → **Redeploy**.
   Shundan so'ng barcha qurilmalar bitta bazani ko'radi va har 4 soniyada yangilanadi.
   *(Ulamasangiz — demo rejim: ma'lumot server xotirasida, qayta ishga tushganda yo'qolishi mumkin.)*

## Sahifalar
| Manzil | Nima |
|---|---|
| `/` | Bosh sahifa: jonli xarita (kichik/o'rta/katta/to'liq ekran), muhtojlar, volontyorlar |
| `/report` | Muhtoj insonni bildirish (ism, yosh, rasm, manzil, xaritada joy, yordam turi…) → dashboardga tushadi |
| `/volunteer` | Volontyor bo'lish (to'liq ma'lumot + rasm) → `/volunteer/[id]` shaxsiy profil |
| `/person/[id]` | Muhtoj inson alohida sahifasi |
| `/admin` | Dashboard — asosiy admin manzili (login: **ism + parol**). Navbar va footer ko'rinmaydi, navigatsiyada havola yo'q |
| `/dashboard` | Dashboardning eski manzili (moslik uchun saqlangan) |

## Dashboard kirishi
Ismlar: `diyora`, `janerke`, `solixa`, `sabina`, `xadicha` · Parol: `mehr`
(o'zgartirish: `lib/auth.ts`)

## O'zgartirish kerak bo'lgan joylar
- **Sayt nomi, karta raqami** (footer): `lib/config.ts` → `SITE`
- **Logo / favicon:** `components/Logo.tsx` va `app/icon.svg`
- Aloqa telefoni: `lib/config.ts`
- Boshlang'ich (demo) ma'lumotlar: `lib/seed.ts` (demo rasmlar randomuser.me dan; haqiqiy
  ma'lumot kiritishni boshlaganingizda demo yozuvlarni dashboarddan o'chirib tashlang)

## Qanday ishlaydi
- Muhtoj yuborilsa → holat **Yangi**, xaritada punktir ramka bilan «Tekshirilmoqda» ko'rinadi.
- Koordinator dashboardda **Tasdiqlash** / holat / shoshilinchlik / izoh / o'chirish qila oladi.
- Telefon va aniq manzil faqat dashboardda (kirgan xodimlarga) ko'rinadi.
- Rasmlar brauzerda siqiladi (480px) va `/api/photo/<id>` orqali beriladi.


## Yangi sozlamalar
- Til: yuqori navigatsiyadagi UZ / RU / EN tanlovi. Barcha interfeys matnlari `lib/i18n.tsx` lug'atida (uz/ru/en) — yangi matn qo'shsangiz uchala tilga ham yozing (TypeScript yetishmayotgan kalitni xato sifatida ko'rsatadi). Tanlov brauzerda saqlanadi.
- Dark mode: oy/quyosh tugmasi; tanlov brauzerda saqlanadi.
- Xarita: Leaflet. Fon plitkalari ketma-ketlikda sinaladi (CARTO → Esri → OpenStreetMap). Agar hech biri yuklanmasa ham xarita ishlaydi: O'zbekiston konturi (`lib/uzb.json`, ichki fayl) va barcha markerlar ko'rinadi.
- Admin: `http://localhost:3000/admin` (Next.js odatiy porti).
- Vercel: barcha foydalanuvchilar orasida ma'lumotni doimiy saqlash uchun Upstash Redis env qiymatlarini ulang.

**Demo rasmlar haqida:** boshlang'ich profil rasmlari `randomuser.me` demo portretlaridir, ular haqiqiy mahalliy fuqarolar deb ko'rsatilmasligi kerak. Haqiqiy odamlarning fotosuratlarini faqat roziligi bilan yuklang.

## v3 yangilanishlar
- **Minimal dizayn:** krem fon, serif sarlavhalar (Instrument Serif), bitta aksent rang, ingichka chiziqlar. Barcha rang tokenlari `app/globals.css` boshida.
- **Jonli hero xarita:** bosh sahifadagi O'zbekiston xaritasida har bir muhtoj inson nuqtasi real vaqtda ko'rinadi.
- **Xarita tuzatildi:** marker harflari ko'rinmasligi (CSS xatosi), plitkalar bloklanganda bo'sh xarita qolishi — endi tuzatilgan.
- **Vercel barqarorligi:** Redis xato bersa ham sayt ochiladi (xotira rejimiga tushadi); Node.js >= 18.18 talab qilinadi.

## GRANDCARE yangilanishi
- Sayt nomi: **GRANDCARE** (header, footer, sarlavha, barcha tillar).
- Yangi logo (yurak + himoya yoyi) header, bank kartasi va favicon uchun.
- Tungi rejim tugmasi emoji o'rniga SVG icon (oy / quyosh). Tema sahifa ochilishidan oldin qo'llanadi (miltillamaydi).
- Dashboard (`/admin`, `/dashboard`): navbar, footer va navigatsiyadagi havola yo'q.
- Xarita: plitkalar osilib qolsa ham keyingi provayderga o'tadi (vaqt chegarasi bilan); xarita konteyner o'lchamiga qarab joylanadi.
- Bosh sahifada jonli lenta: eng so'nggi so'rovlar (ism bosh harflar bilan).
