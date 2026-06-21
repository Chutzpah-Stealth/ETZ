import type { ClassificationLevel } from "../targets";

export type QtcCategory =
  | "novidade"
  | "mencao_orcrim"
  | "vinculo_suspeito"
  | "anotacao_operacional";

export const QTC_CATEGORY_LABEL: Record<QtcCategory, string> = {
  novidade:             "Novidade",
  mencao_orcrim:        "Menção a OrCrim",
  vinculo_suspeito:     "Vínculo Suspeito",
  anotacao_operacional: "Anotação Operacional",
};

/**
 * QTC — Quadro de Transmissão de Conhecimento.
 * Registro ágil de inteligência operacional da unidade (mural cronológico).
 * Vínculo a alvos é mão-única (targetIds); criação/edição/exclusão por qualquer
 * membro da unidade (RBAC por unitId, igual a Alvos/Casos).
 */
export interface QtcEntry {
  id:             string;
  unitId:         string;
  institutionId:  string;
  createdBy:      string;
  createdByEmail: string;
  createdAt:      string;
  updatedAt:      string;
  updatedBy:      string;

  content:        string;
  category:       QtcCategory;
  classification: ClassificationLevel | null;
  targetIds:      string[];
  organizations:  string[];
  vehicles:       string[];
  attachments:    string[];
}
