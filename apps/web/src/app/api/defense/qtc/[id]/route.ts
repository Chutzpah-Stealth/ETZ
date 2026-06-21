import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../../lib/admin-guard";
import type { QtcEntry } from "@etz/shared-types";

type RouteContext = { params: Promise<{ id: string }> };

async function getQtc(id: string, unitId: string) {
  const snap = await adminDb.collection("qtc").doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Omit<QtcEntry, "id">;
  if (data.unitId !== unitId) return null;
  return { id: snap.id, ...data } as QtcEntry;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const entry = await getQtc(id, user.unitId);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as Partial<QtcEntry>;

  delete (body as Partial<QtcEntry> & { id?: string }).id;
  delete body.unitId;
  delete body.institutionId;
  delete body.createdBy;
  delete body.createdByEmail;
  delete body.createdAt;

  const updates = {
    ...body,
    updatedAt: new Date().toISOString(),
    updatedBy: user.uid,
  };

  await adminDb.collection("qtc").doc(id).update(updates);

  await writeAuditLog(user.uid, user.email, "update_qtc", "qtc", id, {
    category: updates.category ?? entry.category,
  });

  const { id: _id, ...entryWithoutId } = entry;
  return NextResponse.json({ id, ...entryWithoutId, ...updates });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const entry = await getQtc(id, user.unitId);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await adminDb.collection("qtc").doc(id).delete();

  await writeAuditLog(user.uid, user.email, "delete_qtc", "qtc", id, {
    category: entry.category,
  });

  return NextResponse.json({ ok: true });
}
