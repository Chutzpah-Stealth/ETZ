import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../../lib/firebase-admin";
import { verifyAdmin, writeAuditLog } from "../../../../../../lib/admin-guard";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const { id: institutionId } = await params;
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });

  const now = new Date().toISOString();
  const docRef = await adminDb
    .collection("institutions")
    .doc(institutionId)
    .collection("units")
    .add({ name, institutionId, status: "active", createdAt: now });

  const callerSnap = await adminDb.collection("users").doc(check.uid).get();
  await writeAuditLog(check.uid, callerSnap.data()?.email ?? "", "create_unit", "unit", docRef.id, { name, institutionId });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
