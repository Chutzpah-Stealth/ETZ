import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyAdmin, writeAuditLog } from "../../../../lib/admin-guard";

export async function GET(req: NextRequest) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const snap = await adminDb.collection("institutions").orderBy("createdAt", "desc").get();
  const institutions = await Promise.all(
    snap.docs.map(async (d) => {
      const unitsSnap = await d.ref.collection("units").get();
      const units = unitsSnap.docs.map(u => ({ id: u.id, ...u.data() }));
      return { id: d.id, ...d.data(), units };
    })
  );
  return NextResponse.json(institutions);
}

export async function POST(req: NextRequest) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });

  const product = "defense";
  const now = new Date().toISOString();
  const docRef = await adminDb.collection("institutions").add({
    name,
    product,
    status: "active",
    createdAt: now,
    createdBy: check.uid,
  });

  const callerSnap = await adminDb.collection("users").doc(check.uid).get();
  await writeAuditLog(check.uid, callerSnap.data()?.email ?? "", "create_institution", "institution", docRef.id, { name, product });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
