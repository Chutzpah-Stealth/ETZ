import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../lib/admin-guard";
import type { Target } from "@etz/shared-types";

// agente_campo sees only own records; gestor/analista see all unit records
export async function GET(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const search  = searchParams.get("search")?.toLowerCase() ?? "";
  const status  = searchParams.get("status") ?? "";
  const risk    = searchParams.get("risk") ?? "";

  let query = adminDb.collection("targets").where("unitId", "==", user.unitId);

  if (user.role === "agente_campo") {
    query = query.where("createdBy", "==", user.uid) as typeof query;
  }

  const snap = await query.orderBy("updatedAt", "desc").get();
  let targets = snap.docs.map(d => ({ id: d.id, ...d.data() } as Target));

  if (search) {
    targets = targets.filter(t =>
      t.fullName.toLowerCase().includes(search) ||
      t.aliases.some(a => a.toLowerCase().includes(search)) ||
      (t.cpf ?? "").includes(search)
    );
  }
  if (status) targets = targets.filter(t => t.status === status);
  if (risk)   targets = targets.filter(t => t.riskLevel === risk);

  return NextResponse.json(targets);
}

export async function POST(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json() as Partial<Target>;

  if (!body.fullName?.trim()) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }

  // CPF uniqueness check within the same unit
  if (body.cpf) {
    const dup = await adminDb.collection("targets")
      .where("unitId", "==", user.unitId)
      .where("cpf", "==", body.cpf)
      .limit(1)
      .get();
    if (!dup.empty) {
      return NextResponse.json({ error: "CPF já cadastrado nesta unidade" }, { status: 409 });
    }
  }

  const now = new Date().toISOString();

  const data: Omit<Target, "id"> = {
    unitId:          user.unitId,
    institutionId:   user.institutionId,
    createdBy:       user.uid,
    createdByEmail:  user.email,
    createdAt:       now,
    updatedAt:       now,
    updatedBy:       user.uid,

    fullName:        body.fullName.trim(),
    birthDate:       body.birthDate       ?? null,
    fatherName:      body.fatherName      ?? null,
    motherName:      body.motherName      ?? null,
    gender:          body.gender          ?? null,
    maritalStatus:   body.maritalStatus   ?? null,
    spouse:          body.spouse          ?? null,
    children:        body.children        ?? null,
    nationality:     body.nationality     ?? null,
    operationAreas:  body.operationAreas  ?? [],
    tattoos:         body.tattoos         ?? [],
    aliases:         body.aliases         ?? [],
    description:     body.description     ?? null,
    vehicles:        body.vehicles        ?? [],

    cpf:             body.cpf             ?? null,
    rg:              body.rg              ?? null,
    passport:        body.passport        ?? null,

    phones:          body.phones          ?? [],
    emails:          body.emails          ?? [],
    addresses:       body.addresses       ?? [],

    criminalHistory: body.criminalHistory ?? [],
    associates:      body.associates      ?? [],
    organizations:   body.organizations   ?? [],
    warrants:        body.warrants        ?? [],

    prisonStatus:    body.prisonStatus    ?? null,
    prisonPavilion:  body.prisonPavilion  ?? null,
    prisonWing:      body.prisonWing      ?? null,
    prisonCell:      body.prisonCell      ?? null,

    status:          body.status          ?? null,
    riskLevel:       body.riskLevel       ?? null,
    classification:  body.classification  ?? null,

    analystNotes:    body.analystNotes    ?? null,
    caseId:          body.caseId          ?? null,
  };

  const ref = await adminDb.collection("targets").add(data);

  await writeAuditLog(user.uid, user.email, "create_target", "target", ref.id, {
    fullName: data.fullName,
  });

  return NextResponse.json({ id: ref.id, ...data }, { status: 201 });
}
