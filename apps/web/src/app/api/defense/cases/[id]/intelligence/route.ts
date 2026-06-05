import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../../../lib/defense-guard";
import { writeAuditLog } from "../../../../../../lib/admin-guard";
import type { Case, IntelligenceProduct, IntelProductType } from "@etz/shared-types";

type RouteContext = { params: Promise<{ id: string }> };

const INTEL_TYPES: IntelProductType[] = ["relatorio", "informe", "analise", "diagrama"];

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

  const body = await req.json() as {
    type?:        IntelProductType;
    title?:       string;
    description?: string;
    attachments?: string[];
  };

  if (!body.type || !INTEL_TYPES.includes(body.type)) {
    return NextResponse.json({ error: "type must be one of: relatorio, informe, analise, diagrama" }, { status: 400 });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const entry: IntelligenceProduct = {
    type:         body.type,
    title:        body.title.trim(),
    description:  body.description?.trim() ?? undefined,
    attachments:  body.attachments ?? [],
    addedBy:      user.uid,
    addedByEmail: user.email,
    addedAt:      new Date().toISOString(),
  };

  const now = new Date().toISOString();

  await adminDb.collection("cases").doc(id).update({
    intelligenceProducts: FieldValue.arrayUnion(entry),
    updatedAt:            now,
    updatedBy:            user.uid,
  });

  await writeAuditLog(user.uid, user.email, "add_intelligence_product", "case", id, {
    name:  caso.name,
    title: entry.title,
    type:  entry.type,
  });

  return NextResponse.json(entry, { status: 201 });
}
