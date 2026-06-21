import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../lib/admin-guard";
import type { Report } from "@etz/shared-types";

export async function GET(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const snap = await adminDb.collection("reports").where("unitId", "==", user.unitId).get();
  const reports = snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Report))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json() as Partial<Report>;
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const data: Omit<Report, "id"> = {
    unitId:         user.unitId,
    institutionId:  user.institutionId,
    createdBy:      user.uid,
    createdByEmail: user.email,
    createdAt:      now,
    updatedAt:      now,
    updatedBy:      user.uid,

    title:          body.title.trim(),
    number:         body.number?.trim() || null,
    status:         body.status ?? "em_edicao",
    classification: body.classification ?? null,
    caseId:         body.caseId ?? null,
    targetIds:      body.targetIds ?? [],
    objetivo:       body.objetivo?.trim()  || null,
    contexto:       body.contexto?.trim()  || null,
    analise:        body.analise?.trim()   || null,
    conclusao:      body.conclusao?.trim() || null,
    attachments:    body.attachments ?? [],
  };

  const ref = await adminDb.collection("reports").add(data);
  await writeAuditLog(user.uid, user.email, "create_report", "report", ref.id, { title: data.title });

  return NextResponse.json({ id: ref.id, ...data }, { status: 201 });
}
