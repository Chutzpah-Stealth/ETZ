import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "../../../../lib/cloudinary";
import { verifyDefenseUser } from "../../../../lib/defense-guard";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou WebP." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande. Máximo 10MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  // UUID-based public_id — no identifiable path structure
  const publicId = `etz/media/${crypto.randomUUID()}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id:     publicId,
    resource_type: "image",
    overwrite:     false,
  });

  return NextResponse.json({ url: result.secure_url });
}

export async function DELETE(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { url } = await req.json() as { url: string };
  if (!url) return NextResponse.json({ error: "url obrigatória" }, { status: 400 });

  // Extract public_id from Cloudinary URL
  const match = url.match(/\/etz\/media\/([^/.]+)/);
  if (!match) return NextResponse.json({ error: "URL inválida" }, { status: 400 });

  const publicId = `etz/media/${match[1]}`;
  await cloudinary.uploader.destroy(publicId);

  return NextResponse.json({ ok: true });
}
