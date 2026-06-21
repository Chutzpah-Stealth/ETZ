import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../lib/admin-guard";
import type { QtcEntry } from "@etz/shared-types";

export async function GET(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId") ?? "";

  const snap = await adminDb
    .collection("qtc")
    .where("unitId", "==", user.unitId)
    .orderBy("createdAt", "desc")
    .get();

  let entries = snap.docs.map(d => ({ id: d.id, ...d.data() } as QtcEntry));

  // filtro opcional por alvo referenciado (gancho mão-dupla futuro)
  if (targetId) entries = entries.filter(e => (e.targetIds ?? []).includes(targetId));

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json() as Partial<QtcEntry>;

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const now = new Date().toISOString();

  const data: Omit<QtcEntry, "id"> = {
    unitId:         user.unitId,
    institutionId:  user.institutionId,
    createdBy:      user.uid,
    createdByEmail: user.email,
    createdAt:      now,
    updatedAt:      now,
    updatedBy:      user.uid,

    content:        body.content.trim(),
    category:       body.category       ?? "novidade",
    classification: body.classification ?? null,
    targetIds:      body.targetIds      ?? [],
    organizations:  body.organizations  ?? [],
    vehicles:       body.vehicles       ?? [],
    attachments:    body.attachments    ?? [],
  };

  const ref = await adminDb.collection("qtc").add(data);

  await writeAuditLog(user.uid, user.email, "create_qtc", "qtc", ref.id, {
    category: data.category,
  });

  return NextResponse.json({ id: ref.id, ...data }, { status: 201 });
}
