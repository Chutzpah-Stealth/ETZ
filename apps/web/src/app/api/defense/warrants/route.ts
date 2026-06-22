import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { verifyDefenseUser } from "../../../../lib/defense-guard";
import type { Target, TargetStatus, RiskLevel } from "@etz/shared-types";

export interface WarrantTarget {
  targetId:       string;
  fullName:       string;
  cpf:            string | null;
  aliases:        string[];
  status:         TargetStatus | null;
  riskLevel:      RiskLevel | null;
  operationAreas: string[];
  photo:          string | null;
  warrants:       { number: string; details: string | null }[];
}

// Mandados de Prisão Ativos: alvos da unidade que possuem mandado registrado.
// Uma só igualdade (unitId) e sem orderBy → não exige índice composto novo;
// o filtro por warrants.length e a ordenação acontecem em memória.
export async function GET(req: NextRequest) {
  const user = await verifyDefenseUser(req);
  if (user instanceof NextResponse) return user;

  const snap = await adminDb.collection("targets").where("unitId", "==", user.unitId).get();

  const rows: WarrantTarget[] = snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Target))
    .filter(t => Array.isArray(t.warrants) && t.warrants.length > 0)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(t => ({
      targetId:       t.id,
      fullName:       t.fullName,
      cpf:            t.cpf ?? null,
      aliases:        t.aliases ?? [],
      status:         t.status ?? null,
      riskLevel:      t.riskLevel ?? null,
      operationAreas: t.operationAreas ?? [],
      photo:          t.photos?.[0] ?? null,
      warrants:       t.warrants.map(w => ({ number: w.number, details: w.details ?? null })),
    }));

  return NextResponse.json(rows);
}
