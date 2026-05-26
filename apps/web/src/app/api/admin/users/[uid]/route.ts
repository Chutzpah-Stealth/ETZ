import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../../../lib/firebase-admin";
import { verifyAdmin, writeAuditLog } from "../../../../../lib/admin-guard";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const { uid } = await params;
  const body = await req.json();
  const { role, institutionId, unitId, status, displayName } = body;

  const userSnap = await adminDb.collection("users").doc(uid).get();
  const userData = userSnap.data();
  const isSuperadmin = userData?.role === "superadmin" || role === "superadmin";

  if (isSuperadmin) {
    // Superadmins gerenciam todos os produtos e instituições — não podem ser vinculados a nenhuma
    if (institutionId !== undefined || unitId !== undefined) {
      return NextResponse.json(
        { error: "Superadmins não são vinculados a instituições ou unidades" },
        { status: 400 }
      );
    }
  } else {
    // product é imutável — rejeitar qualquer tentativa de alteração
    if ("product" in body) {
      return NextResponse.json({ error: "O produto de um usuário não pode ser alterado após a criação" }, { status: 400 });
    }

    // Se está trocando de instituição, garantir que o produto não mude
    if (institutionId !== undefined) {
      const newInstSnap = await adminDb.collection("institutions").doc(institutionId).get();
      const currentProduct = userData?.product ?? null;
      const newProduct = newInstSnap.data()?.product ?? null;
      if (currentProduct && newProduct && currentProduct !== newProduct) {
        return NextResponse.json(
          { error: "Não é possível mover um usuário para uma instituição de produto diferente" },
          { status: 400 }
        );
      }
    }
  }

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (role)         updates.role         = role;
  if (institutionId !== undefined) updates.institutionId = institutionId;
  if (unitId !== undefined)        updates.unitId        = unitId;
  if (status)       updates.status       = status;
  if (displayName)  updates.displayName  = displayName;

  // Promoção para superadmin: zerar vínculos de produto/instituição/unidade
  if (role === "superadmin") {
    updates.product       = null;
    updates.institutionId = null;
    updates.unitId        = null;
  }

  await adminDb.collection("users").doc(uid).update(updates);

  if (role || institutionId !== undefined || unitId !== undefined) {
    const snap = await adminDb.collection("users").doc(uid).get();
    const data = snap.data()!;
    await adminAuth.setCustomUserClaims(uid, {
      role:          data.role,
      product:       data.product ?? null,
      institutionId: data.institutionId,
      unitId:        data.unitId,
    });
  }

  if (status === "revoked") {
    await adminAuth.revokeRefreshTokens(uid);
  }

  const callerSnap = await adminDb.collection("users").doc(check.uid).get();
  await writeAuditLog(check.uid, callerSnap.data()?.email ?? "", "update_user", "user", uid, updates);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const check = await verifyAdmin(req);
  if (check instanceof NextResponse) return check;

  const { uid } = await params;

  await adminAuth.deleteUser(uid);
  await adminDb.collection("users").doc(uid).delete();

  const callerSnap = await adminDb.collection("users").doc(check.uid).get();
  await writeAuditLog(check.uid, callerSnap.data()?.email ?? "", "delete_user", "user", uid, {});

  return NextResponse.json({ ok: true });
}
