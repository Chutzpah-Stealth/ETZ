import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "./firebase-admin";

export async function verifyAdmin(req: NextRequest): Promise<{ uid: string } | NextResponse> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    // Fast path: custom claim already set
    if (decoded.role === "superadmin") return { uid: decoded.uid };

    // Bootstrap path: check Firestore (for first superadmin before claim is set)
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    if (snap.exists && snap.data()?.role === "superadmin") return { uid: decoded.uid };

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function writeAuditLog(
  uid: string,
  userEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown> = {}
) {
  await adminDb.collection("audit_logs").add({
    uid, userEmail, action, targetType, targetId, details,
    timestamp: new Date().toISOString(),
  });
}
