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

  const userRecord = await adminAuth.createUser({ email, password, displayName });
  await adminAuth.setCustomUserClaims(userRecord.uid, { role, institutionId, unitId });

  const now = new Date().toISOString();
  await adminDb.collection("users").doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    displayName: displayName ?? "",
    role,
    institutionId: institutionId ?? null,
    unitId: unitId ?? null,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  // Fetch caller email for audit
  const callerSnap = await adminDb.collection("users").doc(check.uid).get();
  await writeAuditLog(check.uid, callerSnap.data()?.email ?? "", "create_user", "user", userRecord.uid, { email, role });

  return NextResponse.json({ uid: userRecord.uid }, { status: 201 });
}
