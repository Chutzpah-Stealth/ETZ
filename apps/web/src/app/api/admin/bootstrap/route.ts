import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../../lib/firebase-admin";

// One-time endpoint: elevates the caller to superadmin if none exists yet.
export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Block if any superadmin already exists
  const existing = await adminDb.collection("users").where("role", "==", "superadmin").limit(1).get();
  if (!existing.empty) {
    return NextResponse.json({ error: "Superadmin already exists" }, { status: 409 });
  }

  const now = new Date().toISOString();
  await adminDb.collection("users").doc(decoded.uid).set({
    uid: decoded.uid,
    email: decoded.email ?? "",
    displayName: decoded.name ?? decoded.email ?? "",
    role: "superadmin",
    institutionId: null,
    unitId: null,
    status: "active",
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  await adminAuth.setCustomUserClaims(decoded.uid, { role: "superadmin" });

  return NextResponse.json({ ok: true, message: "Superadmin created" });
}
