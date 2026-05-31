import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyAdmin } from "../../../../lib/admin-guard";

export async function GET(req: NextRequest) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const [usersSnap, instSnap, logsSnap] = await Promise.all([
    adminDb.collection("users").get(),
    adminDb.collection("institutions").get(),
    adminDb.collection("audit_logs").orderBy("timestamp", "desc").limit(10).get(),
  ]);

  let totalUnits = 0;
  await Promise.all(
    instSnap.docs.map(async (d) => {
      const unitsSnap = await d.ref.collection("units").count().get();
      totalUnits += unitsSnap.data().count;
    })
  );

  const users = usersSnap.docs.map(d => d.data());

  return NextResponse.json({
    stats: {
      totalUsers:        users.length,
      activeUsers:       users.filter(u => u.status === "active").length,
      totalInstitutions: instSnap.size,
      totalUnits,
    },
    logs: logsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
  });
}
