import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../lib/admin-guard";
import type { Case } from "@etz/shared-types";

export async function GET(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search")?.toLowerCase() ?? "";
  const status   = searchParams.get("status") ?? "";
  const targetId = searchParams.get("targetId") ?? "";

  const snap = await adminDb
    .collection("cases")
    .where("unitId", "==", user.unitId)
    .orderBy("updatedAt", "desc")
    .get();

  let cases = snap.docs.map(d => ({ id: d.id, ...d.data() } as Case));

  if (search)   cases = cases.filter(c => c.name.toLowerCase().includes(search));
  if (status)   cases = cases.filter(c => c.status === status);
  if (targetId) cases = cases.filter(c => (c.caseTargets ?? []).some(l => l.targetId === targetId));

  return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json() as Partial<Case>;

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const now = new Date().toISOString();

  const data: Omit<Case, "id"> = {
    unitId:         user.unitId,
    institutionId:  user.institutionId,
    createdBy:      user.uid,
    createdByEmail: user.email,
    createdAt:      now,
    updatedAt:      now,
    updatedBy:      user.uid,

    name:             body.name.trim(),
    status:           body.status          ?? "em_andamento",
    classification:   body.classification  ?? null,
    operationAreas:   body.operationAreas  ?? [],
    caseNumber:       body.caseNumber      ?? null,
    openedAt:         body.openedAt        ?? null,
    responsibleBy:    body.responsibleBy   ?? null,
    team:             body.team            ?? [],
    partnerAgencies:  body.partnerAgencies ?? [],

    investigationOrigin: null,
    criminalHypothesis:  null,
    history:             body.history       ?? null,
    knownFacts:          body.knownFacts    ?? null,
    pendingHypotheses:   null,
    penalTypifications:  [],

    caseTargets: [],
    locations:   [],

    modusOperandi:      body.modusOperandi ?? null,
    modusCommunication: [],
    modusLogistics:     null,
    modusFinancial:     null,

    relationships: [],

    timeline:             [],
    evidences:            [],
    intelligenceProducts: [],
    chainOfCustody:       [],

    currentSituation: null,
    confidenceLevel:  null,
    nextSteps:        [],

    notes: body.notes ?? null,
  };

  const ref = await adminDb.collection("cases").add(data);

  await writeAuditLog(user.uid, user.email, "create_case", "case", ref.id, {
    name: data.name,
  });

  return NextResponse.json({ id: ref.id, ...data }, { status: 201 });
}
