import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../../../lib/firebase-admin";
import { verifyAdmin, writeAuditLog } from "../../../../../lib/admin-guard";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const { uid } = await params;
  const body = await req.json();
  const { role, institutionId, unitId, status, displayName } = body;

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (role)         updates.role         = role;
  if (institutionId !== undefined) updates.institutionId = institutionId;
  if (unitId !== undefined)        updates.unitId        = unitId;
  if (status)       updates.status       = status;
  if (displayName)  updates.displayName  = displayName;

  await adminDb.collection("users").doc(uid).update(updates);

  if (role || institutionId !== undefined || unitId !== undefined) {
    const snap = await adminDb.collection("users").doc(uid).get();
    const data = snap.data()!;
    await adminAuth.setCustomUserClaims(uid, {
      role:          data.role,
      institutionId: data.institutionId,
      unitId:        data.unitId,
    });
  }

  if (status === "revoked") {
    await adminAuth.revokeRefreshTokens(uid);
  }

  const callerSnap = await adminDb.collection("users").doc(check.uid).get();
  await writeAuditLog(check.uid, callerSnap.data()?.email ?? "", "update_user", "user", uid, updates);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const { uid } = await params;

  await adminAuth.deleteUser(uid);
  await adminDb.collection("users").doc(uid).delete();

  const callerSnap = await adminDb.collection("users").doc(check.uid).get();
  await writeAuditLog(check.uid, callerSnap.data()?.email ?? "", "delete_user", "user", uid, {});

  return NextResponse.json({ ok: true });
}
