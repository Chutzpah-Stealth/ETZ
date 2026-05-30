export type UserProduct = "defense";

export type DefenseRole = "superadmin" | "gestor" | "analista" | "agente_campo";
export type UserRole = DefenseRole;

export type UserStatus = "active" | "revoked";
export type InstitutionStatus = "active" | "inactive";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  product: UserProduct | null;
  institutionId: string | null;
  unitId: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  name: string;
  product: UserProduct;
  status: InstitutionStatus;
  createdAt: string;
  createdBy: string;
}

export interface Unit {
  id: string;
  name: string;
  institutionId: string;
  status: InstitutionStatus;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  uid: string;
  userEmail: string;
  action: string;
  targetType: "user" | "institution" | "unit" | "target" | "case";
  targetId: string;
  details: Record<string, unknown>;
  timestamp: string;
}
