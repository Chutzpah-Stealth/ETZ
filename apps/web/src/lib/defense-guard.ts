import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "./firebase-admin";

export type DefenseRole = "gestor" | "analista" | "agente_campo";

export interface DefenseUser {
  uid:           string;
  email:         string;
  role:          DefenseRole;
  unitId:        string;
  institutionId: string;
}

const DEFENSE_ROLES: DefenseRole[] = ["gestor", "analista", "agente_campo"];

export async function verifyDefenseUser(req: NextRequest): Promise<DefenseUser | NextResponse> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    if (!snap.exists) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const data = snap.data()!;
    const role = data.role as string;

    if (!DEFENSE_ROLES.includes(role as DefenseRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!data.unitId || !data.institutionId) {
      return NextResponse.json({ error: "Forbidden: user has no unit assigned" }, { status: 403 });
    }

    if (data.status === "revoked") {
      return NextResponse.json({ error: "Account revoked" }, { status: 403 });
    }

    return {
      uid:           decoded.uid,
      email:         data.email as string,
      role:          role as DefenseRole,
      unitId:        data.unitId as string,
      institutionId: data.institutionId as string,
    };
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
