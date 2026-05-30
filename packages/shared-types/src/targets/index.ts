export type ClassificationLevel =
  | "confidencial"
  | "secreto"
  | "ultrassecreto"
  | "ts_sci"
  | "sap_acknowledged"
  | "sap_unacknowledged"
  | "sap_waived";

export const CLASSIFICATION_LABEL: Record<ClassificationLevel, string> = {
  confidencial:       "Confidencial",
  secreto:            "Secreto",
  ultrassecreto:      "Ultrassecreto",
  ts_sci:             "TS/SCI",
  sap_acknowledged:   "SAP Acknowledged",
  sap_unacknowledged: "SAP Unacknowledged",
  sap_waived:         "SAP Waived",
};

export type TargetStatus = "investigado" | "suspeito" | "indiciado" | "preso" | "foragido";
export const TARGET_STATUS_LABEL: Record<TargetStatus, string> = {
  investigado: "Investigado",
  suspeito:    "Suspeito",
  indiciado:   "Indiciado",
  preso:       "Preso",
  foragido:    "Foragido",
};

export type RiskLevel = "baixo" | "medio" | "alto";
export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto:  "Alto",
};

export type LinkType = "familiar" | "profissional" | "criminal" | "social" | "outro";
export const LINK_TYPE_LABEL: Record<LinkType, string> = {
  familiar:     "Familiar",
  profissional: "Profissional",
  criminal:     "Criminal",
  social:       "Social",
  outro:        "Outro",
};

export interface TargetTattoo {
  description: string;
  location:    string;
}

export interface TargetAssociate {
  name:      string;
  targetId?: string;
  linkType:  LinkType;
}

export interface TargetWarrant {
  number:   string;
  details?: string;
}

export interface TargetAddress {
  street: string;
  city?:  string;
  state?: string;
  zip?:   string;
}

export interface TargetCriminalRecord {
  crime:  string;
  date?:  string;
  notes?: string;
}

export interface Target {
  id:              string;
  unitId:          string;
  institutionId:   string;
  createdBy:       string;
  createdByEmail:  string;
  createdAt:       string;
  updatedAt:       string;
  updatedBy:       string;

  // Informações Básicas
  fullName:        string;
  birthDate:       string | null;
  fatherName:      string | null;
  motherName:      string | null;
  gender:          "masculino" | "feminino" | "outro" | null;
  maritalStatus:   string | null;
  spouse:          string | null;
  children:        number | null;
  nationality:     string | null;
  operationAreas:  string[];
  tattoos:         TargetTattoo[];
  aliases:         string[];
  description:     string | null;
  vehicles:        string[];

  // Documentos
  cpf:             string | null;
  rg:              string | null;
  passport:        string | null;

  // Contatos
  phones:          string[];
  emails:          string[];
  addresses:       TargetAddress[];

  // Informações Criminais
  criminalHistory: TargetCriminalRecord[];
  associates:      TargetAssociate[];
  organizations:   string[];
  warrants:        TargetWarrant[];

  // Informações Penitenciárias
  prisonStatus:    string | null;
  prisonPavilion:  string | null;
  prisonWing:      string | null;
  prisonCell:      string | null;

  // Análise de Risco
  status:          TargetStatus | null;
  riskLevel:       RiskLevel | null;
  classification:  ClassificationLevel | null;

  // Notas e vínculos
  analystNotes:    string | null;
  caseId:          string | null;
}
