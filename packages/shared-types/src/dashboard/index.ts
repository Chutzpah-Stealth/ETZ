import type { RiskLevel, TargetStatus } from "../targets";

/** Item de alvo enxuto usado nas listas de insight do dashboard. */
export interface DashboardTargetLite {
  id:        string;
  fullName:  string;
  cpf:       string | null;
  riskLevel: RiskLevel | null;
}

/** Alvo com mandado de prisão ativo, no resumo do dashboard. */
export interface DashboardWarrantTarget {
  id:            string;
  fullName:      string;
  status:        TargetStatus | null;
  riskLevel:     RiskLevel | null;
  warrantNumber: string;
  warrantsCount: number;
}

/** Caso parado (sem atualização) listado no dashboard. */
export interface DashboardStaleCase {
  id:        string;
  name:      string;
  updatedAt: string;
}

/** Item da atividade recente do dashboard. */
export interface DashboardActivity {
  type:  "alvo" | "caso" | "qtc";
  id:    string;
  label: string;
  who:   string;
  at:    string;
}

/** Payload do GET /api/defense/dashboard. */
export interface DashboardData {
  kpis: {
    alvos:          number;
    altoRisco:      number;
    casosAndamento: number;
    qtc7d:          number;
    mandadosAtivos: number;
  };
  distRisco:        Record<string, number>;
  distStatusAlvo:   Record<string, number>;
  distStatusCaso:   Record<string, number>;
  distCategoriaQtc: Record<string, number>;
  foragidos:        DashboardTargetLite[];
  altoRiscoSemCaso: DashboardTargetLite[];
  comMandado:       DashboardWarrantTarget[];
  casosParados:     DashboardStaleCase[];
  atividade:        DashboardActivity[];
}
