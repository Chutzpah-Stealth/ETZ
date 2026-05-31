import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../../lib/admin-guard";
import type { Target } from "@etz/shared-types";

type RouteContext = { params: Promise<{ id: string }> };

async function getTarget(id: string, unitId: string) {
  const snap = await adminDb.collection("targets").doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Omit<Target, "id">;
  if (data.unitId !== unitId) return null;
  return { id: snap.id, ...data } as Target;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const target = await getTarget(id, user.unitId);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(target);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const target = await getTarget(id, user.unitId);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as Partial<Target>;

  // Prevent changing ownership fields
  delete (body as Partial<Target> & { id?: string }).id;
  delete body.unitId;
  delete body.institutionId;
  delete body.createdBy;
  delete body.createdByEmail;
  delete body.createdAt;

  // CPF uniqueness check (only if CPF is being changed)
  if (body.cpf && body.cpf !== target.cpf) {
    const dup = await adminDb.collection("targets")
      .where("unitId", "==", user.unitId)
      .where("cpf", "==", body.cpf)
      .limit(1)
      .get();
    if (!dup.empty) {
      return NextResponse.json({ error: "CPF já cadastrado nesta unidade" }, { status: 409 });
    }
  }

  const updates = {
    ...body,
    updatedAt: new Date().toISOString(),
    updatedBy: user.uid,
  };

  await adminDb.collection("targets").doc(id).update(updates);

  await writeAuditLog(user.uid, user.email, "update_target", "target", id, {
    fullName: target.fullName,
  });

  const { id: _id, ...targetWithoutId } = target;
  return NextResponse.json({ id, ...targetWithoutId, ...updates });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const target = await getTarget(id, user.unitId);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await adminDb.collection("targets").doc(id).delete();

  await writeAuditLog(user.uid, user.email, "delete_target", "target", id, {
    fullName: target.fullName,
  });

  return NextResponse.json({ ok: true });
}
