import type { ClassificationLevel } from "../targets";

export type CaseStatus = "em_andamento" | "arquivado" | "finalizado";
export const CASE_STATUS_LABEL: Record<CaseStatus, string> = {
  em_andamento: "Em andamento",
  arquivado:    "Arquivado",
  finalizado:   "Finalizado",
};

export type InvestigationOrigin =
  | "denuncia"
  | "relatorio_inteligencia"
  | "flagrante"
  | "operacao_anterior"
  | "cooperacao_externa";

export const INVESTIGATION_ORIGIN_LABEL: Record<InvestigationOrigin, string> = {
  denuncia:               "Denúncia",
  relatorio_inteligencia: "Relatório de Inteligência",
  flagrante:              "Flagrante",
  operacao_anterior:      "Operação Anterior",
  cooperacao_externa:     "Cooperação Externa",
};

export type CaseTargetRole =
  | "lider"
  | "transportador"
  | "distribuidor"
  | "financeiro"
  | "fornecedor"
  | "laranja"
  | "outro";

export const CASE_TARGET_ROLE_LABEL: Record<CaseTargetRole, string> = {
  lider:         "Líder",
  transportador: "Transportador",
  distribuidor:  "Distribuidor",
  financeiro:    "Financeiro",
  fornecedor:    "Fornecedor",
  laranja:       "Laranja",
  outro:         "Outro",
};

export type LocationType =
  | "residencia"
  | "empresa"
  | "galpao"
  | "fazenda"
  | "deposito"
  | "imovel_alugado"
  | "outro";

export const LOCATION_TYPE_LABEL: Record<LocationType, string> = {
  residencia:    "Residência",
  empresa:       "Empresa",
  galpao:        "Galpão",
  fazenda:       "Fazenda",
  deposito:      "Depósito",
  imovel_alugado:"Imóvel Alugado",
  outro:         "Outro",
};

export type EvidenceType = "documental" | "digital" | "audiovisual" | "testemunhal";
export const EVIDENCE_TYPE_LABEL: Record<EvidenceType, string> = {
  documental:  "Documental",
  digital:     "Digital",
  audiovisual: "Audiovisual",
  testemunhal: "Testemunhal",
};

export type IntelProductType = "relatorio" | "informe" | "analise" | "diagrama";
export const INTEL_PRODUCT_LABEL: Record<IntelProductType, string> = {
  relatorio: "Relatório",
  informe:   "Informe",
  analise:   "Análise",
  diagrama:  "Diagrama",
};

export type ConfidenceLevel = "baixo" | "medio" | "alto";
export const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto:  "Alto",
};

export interface PenalTypification {
  offense: string;
  law?:    string;
}

/**
 * Vínculo N→N entre um alvo (módulo Alvos) e um caso.
 * targetId referencia o alvo real; role é a função do alvo NESTE caso.
 * Um alvo pode constar em vários casos simultaneamente.
 */
export interface CaseTargetLink {
  targetId: string;
  role:     CaseTargetRole;
}

export interface CaseLocation {
  type:               LocationType;
  address?:           string;
  city?:              string;
  state?:             string;
  suspectedPurpose:   string;
  relatedTargetIds:   string[];
}

export interface CaseRelationship {
  sourceName:       string;
  sourceTargetId?:  string;
  targetName:       string;
  destTargetId?:    string;
  relationshipType: string;
  frequency?:       string;
}

export interface TimelineEvent {
  date:         string;
  event:        string;
  addedBy:      string;
  addedByEmail: string;
  addedAt:      string;
}

export interface Evidence {
  type:         EvidenceType;
  description:  string;
  addedBy:      string;
  addedByEmail: string;
  addedAt:      string;
  attachments:  string[];
}

export interface IntelligenceProduct {
  type:         IntelProductType;
  title:        string;
  description?: string;
  addedBy:      string;
  addedByEmail: string;
  addedAt:      string;
  attachments:  string[];
}

export interface ChainOfCustodyEntry {
  description:  string;
  addedBy:      string;
  addedByEmail: string;
  addedAt:      string;
  attachments:  string[];
}

export interface Case {
  id:             string;
  unitId:         string;
  institutionId:  string;
  createdBy:      string;
  createdByEmail: string;
  createdAt:      string;
  updatedAt:      string;
  updatedBy:      string;

  // Identificação
  name:             string;
  status:           CaseStatus;
  classification:   ClassificationLevel | null;
  operationAreas:   string[];
  caseNumber:       string | null;
  openedAt:         string | null;
  responsibleBy:    string | null;
  team:             string[];
  partnerAgencies:  string[];

  // Contexto
  investigationOrigin: InvestigationOrigin | null;
  criminalHypothesis:  string | null;
  history:             string | null;
  knownFacts:          string | null;
  pendingHypotheses:   string | null;
  penalTypifications:  PenalTypification[];

  // Alvos & Locais
  caseTargets: CaseTargetLink[];
  locations:   CaseLocation[];

  // Modus Operandi
  modusOperandi:     string | null;
  modusCommunication: string[];
  modusLogistics:    string | null;
  modusFinancial:    string | null;

  // Rede
  relationships: CaseRelationship[];

  // Append-only (via sub-rotas)
  timeline:             TimelineEvent[];
  evidences:            Evidence[];
  intelligenceProducts: IntelligenceProduct[];
  chainOfCustody:       ChainOfCustodyEntry[];

  // Avaliação
  currentSituation: string | null;
  confidenceLevel:  ConfidenceLevel | null;
  nextSteps:        string[];

  // Notas
  notes: string | null;
}
