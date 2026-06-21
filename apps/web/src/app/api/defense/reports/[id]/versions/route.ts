import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../../../lib/admin-guard";
import type { Report, Case, Target, ReportVersion, ReportCaseSnapshot, ReportTargetSnapshot } from "@etz/shared-types";

type RouteContext = { params: Promise<{ id: string }> };

async function getReport(id: string, unitId: string) {
  const snap = await adminDb.collection("reports").doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Omit<Report, "id">;
  if (data.unitId !== unitId) return null;
  return { id: snap.id, ...data } as Report;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const report = await getReport(id, user.unitId);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const snap = await adminDb.collection("reports").doc(id).collection("versions").get();
  const versions = snap.docs
    .map(d => ({ id: d.id, ...d.data() } as ReportVersion))
    .sort((a, b) => b.version - a.version);

  return NextResponse.json(versions);
}

/**
 * Congela uma versão: copia (snapshot) o relatório + dados ATUAIS do caso e alvos.
 * A versão é imutável — peça oficial datada.
 */
export async function POST(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const report = await getReport(id, user.unitId);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // dados ATUAIS do caso (mesma unidade)
  let caseSnapshot: ReportCaseSnapshot | null = null;
  if (report.caseId) {
    const cSnap = await adminDb.collection("cases").doc(report.caseId).get();
    if (cSnap.exists) {
      const c = cSnap.data() as Case;
      if (c.unitId === user.unitId) {
        caseSnapshot = {
          id: report.caseId, name: c.name, caseNumber: c.caseNumber ?? null,
          status: c.status, classification: c.classification ?? null,
        };
      }
    }
  }

  // dados ATUAIS dos alvos
  const targetsSnapshot: ReportTargetSnapshot[] = [];
  for (const tid of report.targetIds ?? []) {
    const tSnap = await adminDb.collection("targets").doc(tid).get();
    if (!tSnap.exists) continue;
    const t = tSnap.data() as Target;
    if (t.unitId !== user.unitId) continue;
    targetsSnapshot.push({
      id: tid, fullName: t.fullName, aliases: t.aliases ?? [], cpf: t.cpf ?? null,
      status: t.status ?? null, riskLevel: t.riskLevel ?? null, photo: t.photos?.[0] ?? null,
    });
  }

  // próximo número de versão
  const existing = await adminDb.collection("reports").doc(id).collection("versions").get();
  const nextVersion = existing.size + 1;
  const now = new Date().toISOString();

  const version: Omit<ReportVersion, "id"> = {
    version:        nextVersion,
    emittedBy:      user.uid,
    emittedByEmail: user.email,
    emittedAt:      now,
    title:          report.title,
    number:         report.number,
    classification: report.classification,
    objetivo:       report.objetivo,
    contexto:       report.contexto,
    analise:        report.analise,
    conclusao:      report.conclusao,
    attachments:    report.attachments ?? [],
    caseSnapshot,
    targetsSnapshot,
  };

  const ref = await adminDb.collection("reports").doc(id).collection("versions").add(version);
  await writeAuditLog(user.uid, user.email, "freeze_report_version", "report", id, {
    title: report.title, version: nextVersion,
  });

  return NextResponse.json({ id: ref.id, ...version }, { status: 201 });
}
