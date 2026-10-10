import { NextResponse } from "next/server";
import { getPerson, putPerson, savePhoto } from "@/lib/server-db";
import { cleanCategory, cleanDataUrl, cleanHelp, cleanRegion, cleanUrgency, newId, num, str } from "@/lib/sanitize";
import { REGIONS, UZ_BOUNDS, type Person } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  if (body.action === "help") {
    const p = await getPerson(str(body.id, 40));
    if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });
    p.helpers += 1;
    p.updatedAt = Date.now();
    await putPerson(p, 1);
    return NextResponse.json({ ok: true, person: p });
  }

  if (body.action === "create") {
    const name = str(body.name, 80);
    const phone = str(body.phone, 30);
    const story = str(body.story, 800);
    if (name.length < 2 || story.length < 5) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

    const region = cleanRegion(body.region);
    const rc = REGIONS.find((r) => r.name === region)!;
    let lat = num(body.lat, UZ_BOUNDS[0][0], UZ_BOUNDS[1][0], NaN);
    let lng = num(body.lng, UZ_BOUNDS[0][1], UZ_BOUNDS[1][1], NaN);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      lat = rc.lat + (Math.random() - 0.5) * 0.12;
      lng = rc.lng + (Math.random() - 0.5) * 0.12;
    }

    const id = newId("p");
    const photoData = cleanDataUrl(body.photo);
    if (photoData) await savePhoto(id, photoData);

    const now = Date.now();
    const person: Person = {
      id, name, age: num(body.age, 0, 120, 0), category: cleanCategory(body.category),
      region, district: str(body.district, 80), address: str(body.address, 160), phone,
      lat, lng, help: cleanHelp(body.help), urgency: cleanUrgency(body.urgency), story,
      photo: photoData ? `/api/photo/${id}` : "",
      reporter: str(body.reporter, 80) || "Noma'lum",
      status: "new", helpers: 0, createdAt: now, updatedAt: now,
    };
    await putPerson(person);
    return NextResponse.json({ ok: true, person });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
