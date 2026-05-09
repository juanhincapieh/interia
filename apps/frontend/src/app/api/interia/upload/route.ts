import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "expected file field" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) {
    return Response.json({ error: "empty file" }, { status: 400 });
  }
  const ext = path.extname(file.name) || ".jpg";
  const safeExt = /^\.[a-z0-9]+$/i.test(ext) ? ext : ".jpg";
  const name = `${randomUUID()}${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads", "interia");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return Response.json({ url: `/uploads/interia/${name}` });
}
