import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../../lib/firebase-admin";
import { verifyAdmin, writeAuditLog } from "../../../../lib/admin-guard";

export async function GET(req: NextRequest) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const snap = await adminDb.collection("users").orderBy("createdAt", "desc").get();
  const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const { email, password, displayName, role, institutionId, unitId } = await req.json();
  if (!email || !password || !role) {
    return NextResponse.json({ error: "email, password e role são obrigatórios" }, { status: 400 });
  }

  // Superadmins atuam em todos os produtos e instituições — product/institutionId/unitId ficam null
  // Para os demais, product é derivado da instituição (nunca aceito do body)
  const isSuperadmin = role === "superadmin";
  let product: string | null = null;

  if (!isSuperadmin) {
    if (!institutionId) {
      return NextResponse.json({ error: "institutionId é obrigatório para usuários não-superadmin" }, { status: 400 });
    }
    const instSnap = await adminDb.collection("institutions").doc(institutionId).get();
    if (!instSnap.exists) {
      return NextResponse.json({ error: "Instituição não encontrada" }, { status: 400 });
    }
    product = instSnap.data()?.product ?? null;
  }

  const effectiveInstitutionId = isSuperadmin ? null : (institutionId ?? null);
  const effectiveUnitId        = isSuperadmin ? null : (unitId ?? null);

  const userRecord = await adminAuth.createUser({ email, password, displayName });
  await adminAuth.setCustomUserClaims(userRecord.uid, {
    role,
    product,
    institutionId: effectiveInstitutionId,
    unitId: effectiveUnitId,
  });

  const now = new Date().toISOString();
  await adminDb.collection("users").doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    displayName: displayName ?? "",
    role,
    product,
    institutionId: effectiveInstitutionId,
    unitId: effectiveUnitId,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  // Fetch caller email for audit
  const callerSnap = await adminDb.collection("users").doc(check.uid).get();
  await writeAuditLog(check.uid, callerSnap.data()?.email ?? "", "create_user", "user", userRecord.uid, { email, role, product });

  return NextResponse.json({ uid: userRecord.uid }, { status: 201 });
}
