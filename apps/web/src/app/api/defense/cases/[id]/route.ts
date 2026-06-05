import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../../lib/admin-guard";
import type { Case } from "@etz/shared-types";

type RouteContext = { params: Promise<{ id: string }> };

async function getCase(id: string, unitId: string) {
  const snap = await adminDb.collection("cases").doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Omit<Case, "id">;
  if (data.unitId !== unitId) return null;
  return { id: snap.id, ...data } as Case;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const caso = await getCase(id, user.unitId);
  if (!caso) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(caso);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const caso = await getCase(id, user.unitId);
  if (!caso) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as Partial<Case>;

  delete (body as Partial<Case> & { id?: string }).id;
  delete body.unitId;
  delete body.institutionId;
  delete body.createdBy;
  delete body.createdByEmail;
  delete body.createdAt;
  // append-only fields — somente via sub-rotas dedicadas
  delete body.chainOfCustody;
  delete body.timeline;
  delete body.evidences;
  delete body.intelligenceProducts;

  const updates = {
    ...body,
    updatedAt: new Date().toISOString(),
    updatedBy: user.uid,
  };

  await adminDb.collection("cases").doc(id).update(updates);

  await writeAuditLog(user.uid, user.email, "update_case", "case", id, {
    name: caso.name,
  });

  const { id: _id, ...casoWithoutId } = caso;
  return NextResponse.json({ id, ...casoWithoutId, ...updates });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const caso = await getCase(id, user.unitId);
  if (!caso) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await adminDb.collection("cases").doc(id).delete();

  await writeAuditLog(user.uid, user.email, "delete_case", "case", id, {
    name: caso.name,
  });

  return NextResponse.json({ ok: true });
}
