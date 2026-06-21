import type { ClassificationLevel } from "../targets";

export type ReportStatus = "em_edicao" | "finalizado";

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  em_edicao:  "Em edição",
  finalizado: "Finalizado",
};

/**
 * Relatório de inteligência (caso + alvos + narrativa do analista).
 * Modelo "ao vivo": guarda referências (caseId/targetIds); o PDF puxa os dados
 * atuais na emissão (com carimbo de data). Para peças imutáveis, use "congelar
 * versão" → cria um ReportVersion (snapshot completo, somente-leitura).
 * RBAC por unitId (igual a Alvos/Casos/QTC).
 */
export interface Report {
  id:             string;
  unitId:         string;
  institutionId:  string;
  createdBy:      string;
  createdByEmail: string;
  createdAt:      string;
  updatedAt:      string;
  updatedBy:      string;

  title:          string;
  number:         string | null;
  status:         ReportStatus;
  classification: ClassificationLevel | null;

  caseId:         string | null;   // referência ao caso (ao vivo)
  targetIds:      string[];        // referências aos alvos (ao vivo)

  // narrativa do analista
  objetivo:       string | null;
  contexto:       string | null;
  analise:        string | null;
  conclusao:      string | null;

  attachments:    string[];
}

/** Snapshot embutido do caso no momento do congelamento. */
export interface ReportCaseSnapshot {
  id:             string;
  name:           string;
  caseNumber:     string | null;
  status:         string;
  classification: ClassificationLevel | null;
}

/** Snapshot embutido de um alvo no momento do congelamento. */
export interface ReportTargetSnapshot {
  id:        string;
  fullName:  string;
  aliases:   string[];
  cpf:       string | null;
  status:    string | null;
  riskLevel: string | null;
  photo:     string | null;
}

/**
 * Versão congelada (imutável) de um relatório — peça oficial datada.
 * Copia os dados (não referências) do relatório + caso + alvos no instante da emissão.
 * Vive na subcoleção reports/{reportId}/versions.
 */
export interface ReportVersion {
  id:             string;
  version:        number;
  emittedBy:      string;
  emittedByEmail: string;
  emittedAt:      string;

  title:          string;
  number:         string | null;
  classification: ClassificationLevel | null;
  objetivo:       string | null;
  contexto:       string | null;
  analise:        string | null;
  conclusao:      string | null;
  attachments:    string[];

  caseSnapshot:    ReportCaseSnapshot | null;
  targetsSnapshot: ReportTargetSnapshot[];
}
