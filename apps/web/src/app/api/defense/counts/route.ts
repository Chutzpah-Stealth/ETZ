import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../lib/defense-guard";

/**
 * Contagem de alvos, casos, QTCs, relatórios e mandados ativos da unidade.
 *
 * Alvos/casos/QTC/relatórios usam agregação count() (~1 leitura cada).
 * Mandados precisa varrer os alvos (mandado é array embutido, count() não filtra
 * por tamanho de array) → o scan fica atrás de unstable_cache TTL 60s/unidade,
 * então roda no máximo 1×/60s por unidade, compartilhado entre usuários e navegações.
 */
export async function GET(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const unitId = user.unitId;

  const mandadosCached = unstable_cache(
    async () => {
      const snap = await adminDb.collection("targets").where("unitId", "==", unitId).get();
      let n = 0;
      snap.forEach(d => {
        const w = d.get("warrants");
        if (Array.isArray(w) && w.length > 0) n++;
      });
      return n;
    },
    ["defense-warrants-count", unitId],
    { revalidate: 60, tags: [`warrants:${unitId}`] },
  );

  const [targetsAgg, casesAgg, qtcAgg, reportsAgg, mandados] = await Promise.all([
    adminDb.collection("targets").where("unitId", "==", unitId).count().get(),
    adminDb.collection("cases").where("unitId", "==", unitId).count().get(),
    adminDb.collection("qtc").where("unitId", "==", unitId).count().get(),
    adminDb.collection("reports").where("unitId", "==", unitId).count().get(),
    mandadosCached(),
  ]);

  return NextResponse.json({
    alvos:      targetsAgg.data().count,
    casos:      casesAgg.data().count,
    qtc:        qtcAgg.data().count,
    relatorios: reportsAgg.data().count,
    mandados,
  });
}
