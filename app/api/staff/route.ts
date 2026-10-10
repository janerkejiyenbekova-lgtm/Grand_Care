import { NextResponse } from "next/server";
import { checkStaff } from "@/lib/auth";
import { getPerson, putPerson, removePerson, removeVolunteer } from "@/lib/server-db";
import { cleanUrgency, str } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  const who = checkStaff(str(body.name, 40), str(body.password, 40));
  if (!who) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  switch (body.action) {
    case "login":
      return NextResponse.json({ ok: true, name: who });

    case "setStatus": {
      const p = await getPerson(str(body.id, 40));
      if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });
      const st = ["new", "verified", "helped", "closed"].includes(body.status) ? body.status : p.status;
      p.status = st; p.updatedAt = Date.now();
      await putPerson(p);
      return NextResponse.json({ ok: true });
    }
    case "setUrgency": {
      const p = await getPerson(str(body.id, 40));
      if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });
      p.urgency = cleanUrgency(body.urgency); p.updatedAt = Date.now();
      await putPerson(p);
      return NextResponse.json({ ok: true });
    }
    case "setNote": {
      const p = await getPerson(str(body.id, 40));
      if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });
      p.staffNote = str(body.note, 500) ? `${str(body.note, 500)} — ${who}` : ""; p.updatedAt = Date.now();
      await putPerson(p);
      return NextResponse.json({ ok: true });
    }
    case "deletePerson":
      await removePerson(str(body.id, 40));
      return NextResponse.json({ ok: true });
    case "deleteVolunteer":
      await removeVolunteer(str(body.id, 40));
      return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
