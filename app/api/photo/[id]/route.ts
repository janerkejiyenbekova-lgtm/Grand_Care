import { loadPhoto } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const data = await loadPhoto(id.slice(0, 40));
  if (!data) return new Response("not found", { status: 404 });
  const m = data.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!m) return new Response("bad", { status: 500 });
  const buf = Buffer.from(m[2], "base64");
  return new Response(buf, {
    headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=3600" },
  });
}
