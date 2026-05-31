import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyAdmin } from "../../../../lib/admin-guard";

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const after = req.nextUrl.searchParams.get("after");

  let q = adminDb
    .collection("audit_logs")
    .orderBy("timestamp", "desc")
    .limit(PAGE_SIZE);

  if (after) {
    q = q.startAfter(after);
  }

  const snap = await q.get();
  const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as { id: string; timestamp?: string; [k: string]: unknown }));

  return NextResponse.json({
    logs,
    hasMore:    snap.size === PAGE_SIZE,
    nextCursor: logs[logs.length - 1]?.timestamp ?? null,
  });
}
