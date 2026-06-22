import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../lib/defense-guard";
import type { Target, Case, QtcEntry, RiskLevel, DashboardData } from "@etz/shared-types";

const STALE_DAYS = 14;
const RECENT_QTC_DAYS = 7;
const ACTIVITY_LIMIT = 8;
const LIST_LIMIT = 6;

async function computeDashboard(unitId: string): Promise<DashboardData> {
  // sem orderBy → uma só igualdade por query → não exige índice composto novo
  const [tSnap, cSnap, qSnap] = await Promise.all([
    adminDb.collection("targets").where("unitId", "==", unitId).get(),
    adminDb.collection("cases").where("unitId", "==", unitId).get(),
    adminDb.collection("qtc").where("unitId", "==", unitId).get(),
  ]);

  const targets = tSnap.docs.map(d => ({ id: d.id, ...d.data() } as Target));
  const cases   = cSnap.docs.map(d => ({ id: d.id, ...d.data() } as Case));
  const qtc     = qSnap.docs.map(d => ({ id: d.id, ...d.data() } as QtcEntry));

  const now = Date.now();
  const qtcCutoff   = new Date(now - RECENT_QTC_DAYS * 864e5).toISOString();
  const staleCutoff = new Date(now - STALE_DAYS * 864e5).toISOString();

  const inc = (m: Record<string, number>, k: string) => { m[k] = (m[k] ?? 0) + 1; };

  const distRisco: Record<string, number> = {};
  const distStatusAlvo: Record<string, number> = {};
  for (const t of targets) {
    inc(distRisco, t.riskLevel ?? "semRisco");
    inc(distStatusAlvo, t.status ?? "semStatus");
  }

  const distStatusCaso: Record<string, number> = {};
  for (const c of cases) inc(distStatusCaso, c.status);

  const distCategoriaQtc: Record<string, number> = {};
  for (const q of qtc) inc(distCategoriaQtc, q.category);

  // alvos referenciados em qualquer caso (para "alto risco sem caso")
  const referenced = new Set<string>();
  for (const c of cases) for (const l of c.caseTargets ?? []) referenced.add(l.targetId);

  const isHigh = (r: RiskLevel | null) => r === "alto" || r === "critico";
  const toLite = (t: Target) => ({ id: t.id, fullName: t.fullName, cpf: t.cpf ?? null, riskLevel: t.riskLevel ?? null });

  const foragidos = targets.filter(t => t.status === "foragido").slice(0, LIST_LIMIT).map(toLite);
  const altoRiscoSemCaso = targets.filter(t => isHigh(t.riskLevel) && !referenced.has(t.id)).slice(0, LIST_LIMIT).map(toLite);

  // Mandados de prisão ativos — computados dos alvos já carregados (sem leitura extra)
  const withWarrants = targets.filter(t => Array.isArray(t.warrants) && t.warrants.length > 0);
  const riskRank: Record<string, number> = { critico: 0, alto: 1, medio: 2, baixo: 3 };
  const comMandado = [...withWarrants]
    .sort((a, b) => {
      const af = a.status === "foragido" ? 0 : 1;
      const bf = b.status === "foragido" ? 0 : 1;
      if (af !== bf) return af - bf;
      return (riskRank[a.riskLevel ?? ""] ?? 4) - (riskRank[b.riskLevel ?? ""] ?? 4);
    })
    .slice(0, LIST_LIMIT)
    .map(t => ({
      id: t.id, fullName: t.fullName,
      status: t.status ?? null, riskLevel: t.riskLevel ?? null,
      warrantNumber: t.warrants[0].number, warrantsCount: t.warrants.length,
    }));
  const casosParados = cases
    .filter(c => c.status === "em_andamento" && c.updatedAt < staleCutoff)
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    .slice(0, LIST_LIMIT)
    .map(c => ({ id: c.id, name: c.name, updatedAt: c.updatedAt }));

  const atividade = [
    ...targets.map(t => ({ type: "alvo" as const, id: t.id, label: t.fullName, who: t.createdByEmail, at: t.updatedAt })),
    ...cases.map(c => ({ type: "caso" as const, id: c.id, label: c.name, who: c.createdByEmail, at: c.updatedAt })),
    ...qtc.map(q => ({ type: "qtc" as const, id: q.id, label: q.content.slice(0, 60), who: q.createdByEmail, at: q.updatedAt })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, ACTIVITY_LIMIT);

  return {
    kpis: {
      alvos:          targets.length,
      altoRisco:      targets.filter(t => isHigh(t.riskLevel)).length,
      casosAndamento: cases.filter(c => c.status === "em_andamento").length,
      qtc7d:          qtc.filter(q => q.createdAt >= qtcCutoff).length,
      mandadosAtivos: withWarrants.reduce((n, t) => n + t.warrants.length, 0),
    },
    distRisco, distStatusAlvo, distStatusCaso, distCategoriaQtc,
    foragidos, altoRiscoSemCaso, comMandado, casosParados, atividade,
  };
}

export async function GET(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  // Cache do Data Cache do Next.js: leituras ao Firestore acontecem no máximo
  // 1×/60s por unidade, independentemente de quantos usuários abrem o dashboard.
  const cached = unstable_cache(
    () => computeDashboard(user.unitId),
    ["defense-dashboard", user.unitId],
    { revalidate: 60, tags: [`dashboard:${user.unitId}`] },
  );

  return NextResponse.json(await cached());
}
