import { NextResponse } from "next/server";
import { putVolunteer, savePhoto } from "@/lib/server-db";
import { cleanDataUrl, cleanDays, cleanHelp, cleanRegion, newId, num, str } from "@/lib/sanitize";
import type { Volunteer } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  const name = str(body.name, 80);
  const phone = str(body.phone, 30);
  if (name.length < 2 || phone.length < 7) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  const id = newId("v");
  const photoData = cleanDataUrl(body.photo);
  if (photoData) await savePhoto(id, photoData);

  const vol: Volunteer = {
    id, name, phone, age: num(body.age, 14, 100, 18),
    region: cleanRegion(body.region), district: str(body.district, 80),
    days: cleanDays(body.days), skills: cleanHelp(body.skills), about: str(body.about, 600),
    photo: photoData ? `/api/photo/${id}` : "", createdAt: Date.now(),
  };
  await putVolunteer(vol);
  return NextResponse.json({ ok: true, volunteer: vol });
}
