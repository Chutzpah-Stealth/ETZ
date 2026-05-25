O que vai em cada pasta?
audit/

Tudo relacionado a trilha de auditoria.

audit/
├── action-logger.ts
├── audit-events.ts
├── immutable-log.ts
├── chain-of-custody.ts
└── types.ts
auth/

Autenticação.

auth/
├── firebase-auth.ts
├── jwt.ts
├── session.ts
├── tokens.ts
├── auth-context.ts
└── types.ts
classification/

Muito importante no ETZ.

classification/
├── levels.ts
├── clearance.ts
├── access-matrix.ts
├── classification-engine.ts
└── types.ts
Exemplo
CONFIDENTIAL
SECRET
TOP_SECRET
TS_SCI
SAP
encryption/

Criptografia.

encryption/
├── encrypt.ts
├── decrypt.ts
├── hashing.ts
├── key-management.ts
└── field-encryption.ts
permissions/

RBAC + ABAC.

permissions/
├── rbac/
├── abac/
├── policies/
├── guards/
├── resolvers/
└── types.ts
validators/

Validações de segurança.

validators/
├── cpf-validator.ts
├── payload-validator.ts
├── upload-validator.ts
├── input-sanitizer.ts
└── schema-validator.ts
policies/

Regras organizacionais.

policies/
├── password-policy.ts
├── retention-policy.ts
├── access-policy.ts
└── upload-policy.ts
guards/

Guards compartilhados.

guards/
├── auth.guard.ts
├── roles.guard.ts
├── clearance.guard.ts
└── tenant.guard.ts
middleware/

Middlewares globais.

middleware/
├── audit.middleware.ts
├── rate-limit.middleware.ts
├── request-context.middleware.ts
└── security-headers.middleware.ts
logging/

Segurança e rastreabilidade.

logging/
├── security-logger.ts
├── anomaly-logger.ts
├── access-logger.ts
└── forensic-logger.ts
packages/shared-types/
Estrutura ideal
shared-types/
├── auth/
├── users/
├── targets/
├── cases/
├── graph/
├── analytics/
├── notifications/
├── api/
├── common/
└── README.md
auth/
auth/
├── session.types.ts
├── token.types.ts
└── permissions.types.ts
users/
users/
├── user.types.ts
├── roles.types.ts
└── unit.types.ts
targets/

Muito importante.

targets/
├── target.types.ts
├── relationship.types.ts
├── vehicle.types.ts
├── organization.types.ts
└── risk.types.ts
cases/
cases/
├── case.types.ts
├── evidence.types.ts
├── operation.types.ts
└── timeline.types.ts
graph/
graph/
├── nodes.types.ts
├── edges.types.ts
├── communities.types.ts
└── paths.types.ts
analytics/
analytics/
├── metrics.types.ts
├── heatmap.types.ts
├── kpi.types.ts
└── report.types.ts
notifications/
notifications/
├── alert.types.ts
├── notification.types.ts
└── realtime.types.ts
api/
api/
├── request.types.ts
├── response.types.ts
├── pagination.types.ts
└── error.types.ts
common/
common/
├── enums.ts
├── ids.ts
├── timestamps.ts
└── metadata.ts
packages/ui/
Estrutura ideal
ui/
├── components/
├── layouts/
├── forms/
├── tables/
├── charts/
├── modals/
├── navigation/
├── theme/
├── icons/
└── README.md
packages/utils/
MUITO importante:
manter utils PEQUENO.
Estrutura
utils/
├── date/
├── format/
├── strings/
├── numbers/
├── arrays/
├── objects/
└── common/
NÃO colocar aqui

❌ regra de negócio
❌ intelligence
❌ cases
❌ graph
❌ risk

Estrutura FINAL recomendada
packages/
├── security/
│   ├── audit/
│   ├── auth/
│   ├── classification/
│   ├── encryption/
│   ├── permissions/
│   ├── validators/
│   ├── policies/
│   ├── guards/
│   ├── middleware/
│   └── logging/
│
├── shared-types/
│   ├── auth/
│   ├── users/
│   ├── targets/
│   ├── cases/
│   ├── graph/
│   ├── analytics/
│   ├── notifications/
│   ├── api/
│   └── common/
│
├── ui/
└── utils/