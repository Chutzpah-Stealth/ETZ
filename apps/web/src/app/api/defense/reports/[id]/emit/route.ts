import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../../../lib/admin-guard";
import type { Report } from "@etz/shared-types";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Registra uma emissão (impressão/PDF) do relatório no audit log.
 * Dá rastreabilidade: quem emitiu, quando — combinado com o carimbo de data no PDF.
 */
export async function POST(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const snap = await adminDb.collection("reports").doc(id).get();
  if (!snap.exists || (snap.data() as Report).unitId !== user.unitId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await writeAuditLog(user.uid, user.email, "emit_report", "report", id, {
    title: (snap.data() as Report).title,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
