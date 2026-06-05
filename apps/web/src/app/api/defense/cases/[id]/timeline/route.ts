import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../../../lib/admin-guard";
import type { Case, TimelineEvent } from "@etz/shared-types";

type RouteContext = { params: Promise<{ id: string }> };

async function getCase(id: string, unitId: string) {
  const snap = await adminDb.collection("cases").doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Omit<Case, "id">;
  if (data.unitId !== unitId) return null;
  return { id: snap.id, ...data } as Case;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const caso = await getCase(id, user.unitId);
  if (!caso) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as { date?: string; event?: string };

  if (!body.date?.trim() || !body.event?.trim()) {
    return NextResponse.json({ error: "date and event are required" }, { status: 400 });
  }

  const entry: TimelineEvent = {
    date:         body.date.trim(),
    event:        body.event.trim(),
    addedBy:      user.uid,
    addedByEmail: user.email,
    addedAt:      new Date().toISOString(),
  };

  const now = new Date().toISOString();

  await adminDb.collection("cases").doc(id).update({
    timeline:  FieldValue.arrayUnion(entry),
    updatedAt: now,
    updatedBy: user.uid,
  });

  await writeAuditLog(user.uid, user.email, "add_timeline_event", "case", id, {
    name: caso.name,
    date: entry.date,
  });

  return NextResponse.json(entry, { status: 201 });
}
