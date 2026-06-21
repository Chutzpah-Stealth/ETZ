import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../lib/defense-guard";

/**
 * Contagem de alvos, casos e QTCs da unidade via agregação count().
 * Custa ~3 leituras (em vez de baixar as listas inteiras) — usado pelo contador da sidebar.
 */
export async function GET(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const [targetsAgg, casesAgg, qtcAgg] = await Promise.all([
    adminDb.collection("targets").where("unitId", "==", user.unitId).count().get(),
    adminDb.collection("cases").where("unitId", "==", user.unitId).count().get(),
    adminDb.collection("qtc").where("unitId", "==", user.unitId).count().get(),
  ]);

  return NextResponse.json({
    alvos: targetsAgg.data().count,
    casos: casesAgg.data().count,
    qtc:   qtcAgg.data().count,
  });
}
