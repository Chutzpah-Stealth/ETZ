import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../../../lib/admin-guard";
import type { Case, CaseTargetLink, CaseTargetRole } from "@etz/shared-types";

type RouteContext = { params: Promise<{ id: string }> };

const ROLES: CaseTargetRole[] = ["lider", "transportador", "distribuidor", "financeiro", "fornecedor", "laranja", "outro"];

/**
 * Vincula (upsert) um alvo ao caso, ou atualiza a função.
 * Atômico via transação — usado tanto pelo lado do caso quanto pelo lado do alvo.
 * body: { targetId: string; role?: CaseTargetRole }
 */
export async function POST(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const body = await req.json() as { targetId?: string; role?: CaseTargetRole };

  if (!body.targetId?.trim()) {
    return NextResponse.json({ error: "targetId is required" }, { status: 400 });
  }
  const role: CaseTargetRole = body.role && ROLES.includes(body.role) ? body.role : "outro";
  const now = new Date().toISOString();

  try {
    await adminDb.runTransaction(async (tx) => {
      const ref  = adminDb.collection("cases").doc(id);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("NOT_FOUND");
      const data = snap.data() as Omit<Case, "id">;
      if (data.unitId !== user.unitId) throw new Error("NOT_FOUND");

      // valida que o alvo pertence à mesma unidade
      const tSnap = await tx.get(adminDb.collection("targets").doc(body.targetId!));
      if (!tSnap.exists || (tSnap.data() as { unitId?: string }).unitId !== user.unitId) {
        throw new Error("NOT_FOUND");
      }

      const links: CaseTargetLink[] = (data.caseTargets ?? []).filter(l => l.targetId !== body.targetId);
      links.push({ targetId: body.targetId!, role });
      tx.update(ref, { caseTargets: links, updatedAt: now, updatedBy: user.uid });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw e;
  }

  await writeAuditLog(user.uid, user.email, "link_target_case", "case", id, { targetId: body.targetId, role });
  return NextResponse.json({ ok: true, targetId: body.targetId, role }, { status: 200 });
}

/**
 * Desvincula um alvo do caso.
 * body: { targetId: string }
 */
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({})) as { targetId?: string };
  const targetId = body.targetId ?? new URL(req.url).searchParams.get("targetId") ?? "";

  if (!targetId) {
    return NextResponse.json({ error: "targetId is required" }, { status: 400 });
  }
  const now = new Date().toISOString();

  try {
    await adminDb.runTransaction(async (tx) => {
      const ref  = adminDb.collection("cases").doc(id);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("NOT_FOUND");
      const data = snap.data() as Omit<Case, "id">;
      if (data.unitId !== user.unitId) throw new Error("NOT_FOUND");

      const links: CaseTargetLink[] = (data.caseTargets ?? []).filter(l => l.targetId !== targetId);
      tx.update(ref, { caseTargets: links, updatedAt: now, updatedBy: user.uid });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw e;
  }

  await writeAuditLog(user.uid, user.email, "unlink_target_case", "case", id, { targetId });
  return NextResponse.json({ ok: true });
}
