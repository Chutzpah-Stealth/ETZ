import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../../lib/admin-guard";
import type { Report } from "@etz/shared-types";

type RouteContext = { params: Promise<{ id: string }> };

async function getReport(id: string, unitId: string) {
  const snap = await adminDb.collection("reports").doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Omit<Report, "id">;
  if (data.unitId !== unitId) return null;
  return { id: snap.id, ...data } as Report;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const report = await getReport(id, user.unitId);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const report = await getReport(id, user.unitId);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as Partial<Report>;
  delete (body as Partial<Report> & { id?: string }).id;
  delete body.unitId;
  delete body.institutionId;
  delete body.createdBy;
  delete body.createdByEmail;
  delete body.createdAt;

  const updates = { ...body, updatedAt: new Date().toISOString(), updatedBy: user.uid };
  await adminDb.collection("reports").doc(id).update(updates);
  await writeAuditLog(user.uid, user.email, "update_report", "report", id, { title: updates.title ?? report.title });

  const { id: _id, ...rest } = report;
  return NextResponse.json({ id, ...rest, ...updates });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const report = await getReport(id, user.unitId);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await adminDb.collection("reports").doc(id).delete();
  await writeAuditLog(user.uid, user.email, "delete_report", "report", id, { title: report.title });

  return NextResponse.json({ ok: true });
}
