import { NextRequest } from "next/server";

const mockVerifyIdToken = jest.fn();
const mockSetCustomUserClaims = jest.fn();
const mockRevokeRefreshTokens = jest.fn();
const mockUserGet = jest.fn();
const mockInstGet = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserGetAfterUpdate = jest.fn();
const mockAuditAdd = jest.fn();

jest.mock("../../lib/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: mockVerifyIdToken,
    setCustomUserClaims: mockSetCustomUserClaims,
    revokeRefreshTokens: mockRevokeRefreshTokens,
  },
  adminDb: {
    collection: (col: string) => {
      if (col === "institutions") return { doc: () => ({ get: mockInstGet }) };
      if (col === "audit_logs")  return { add: mockAuditAdd };
      return {
        doc: (uid: string) => ({
          get: uid === "caller1" ? jest.fn().mockResolvedValue({ exists: true, data: () => ({ email: "admin@etz.com" }) })
                                 : mockUserGet,
          update: mockUserUpdate,
        }),
      };
    },
  },
}));

import { PATCH } from "../../app/api/admin/users/[uid]/route";

function makeReq(uid: string, body: object): NextRequest {
  return new NextRequest(`http://localhost/api/admin/users/${uid}`, {
    method: "PATCH",
    headers: { Authorization: "Bearer valid", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifyIdToken.mockResolvedValue({ uid: "caller1", role: "superadmin" });
  mockUserUpdate.mockResolvedValue(undefined);
  mockSetCustomUserClaims.mockResolvedValue(undefined);
  mockAuditAdd.mockResolvedValue({});
});

describe("PATCH /api/admin/users/[uid]", () => {
  it("retorna 400 se product está no body", async () => {
    mockUserGet.mockResolvedValue({ exists: true, data: () => ({ role: "analista", product: "defense" }) });

    const res = await PATCH(makeReq("u1", { product: "business" }), { params: Promise.resolve({ uid: "u1" }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/produto.*não pode ser alterado/i);
  });

  it("permite mover para instituição (mesmo produto defense)", async () => {
    mockUserGet
      .mockResolvedValueOnce({ exists: true, data: () => ({ role: "analista", product: "defense" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ role: "analista", product: "defense", institutionId: "inst-defense-2", unitId: null }) });
    mockInstGet.mockResolvedValue({ exists: true, data: () => ({ product: "defense" }) });

    const res = await PATCH(makeReq("u1", { institutionId: "inst-defense-2" }), { params: Promise.resolve({ uid: "u1" }) });
    expect(res.status).toBe(200);
  });

  it("retorna 400 ao vincular superadmin a institutionId", async () => {
    mockUserGet.mockResolvedValue({ exists: true, data: () => ({ role: "superadmin", product: null }) });

    const res = await PATCH(makeReq("super1", { institutionId: "inst1" }), { params: Promise.resolve({ uid: "super1" }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/superadmin/i);
  });

  it("retorna 400 ao vincular superadmin a unitId", async () => {
    mockUserGet.mockResolvedValue({ exists: true, data: () => ({ role: "superadmin", product: null }) });

    const res = await PATCH(makeReq("super1", { unitId: "unit1" }), { params: Promise.resolve({ uid: "super1" }) });
    expect(res.status).toBe(400);
  });

  it("retorna 400 ao promover para superadmin com institutionId no mesmo body", async () => {
    mockUserGet.mockResolvedValue({ exists: true, data: () => ({ role: "analista", product: "defense" }) });

    const res = await PATCH(makeReq("u1", { role: "superadmin", institutionId: "inst1" }), { params: Promise.resolve({ uid: "u1" }) });
    expect(res.status).toBe(400);
  });

  it("inclui product nos custom claims após update de role", async () => {
    mockUserGet
      .mockResolvedValueOnce({ exists: true, data: () => ({ role: "analista", product: "defense" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ role: "gestor", product: "defense", institutionId: "inst1", unitId: null }) });

    await PATCH(makeReq("u1", { role: "gestor" }), { params: Promise.resolve({ uid: "u1" }) });

    expect(mockSetCustomUserClaims).toHaveBeenCalledWith("u1", expect.objectContaining({ product: "defense" }));
  });

  it("chama revokeRefreshTokens quando status=revoked", async () => {
    mockUserGet.mockResolvedValue({ exists: true, data: () => ({ role: "analista", product: "defense" }) });

    await PATCH(makeReq("u1", { status: "revoked" }), { params: Promise.resolve({ uid: "u1" }) });

    expect(mockRevokeRefreshTokens).toHaveBeenCalledWith("u1");
  });

  it("grava audit log com action=update_user", async () => {
    mockUserGet.mockResolvedValue({ exists: true, data: () => ({ role: "analista", product: "defense" }) });

    await PATCH(makeReq("u1", { displayName: "Novo Nome" }), { params: Promise.resolve({ uid: "u1" }) });

    expect(mockAuditAdd).toHaveBeenCalledWith(expect.objectContaining({ action: "update_user" }));
  });

  it("promoção para superadmin zera product/institutionId/unitId no Firestore e nas claims", async () => {
    mockUserGet
      .mockResolvedValueOnce({ exists: true, data: () => ({ role: "analista", product: "defense", institutionId: "inst1", unitId: "unit1" }) })
      .mockResolvedValueOnce({ exists: true, data: () => ({ role: "superadmin", product: null, institutionId: null, unitId: null }) });

    const res = await PATCH(makeReq("u1", { role: "superadmin" }), { params: Promise.resolve({ uid: "u1" }) });
    expect(res.status).toBe(200);

    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: "superadmin", product: null, institutionId: null, unitId: null })
    );
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith("u1", expect.objectContaining({
      role: "superadmin",
      product: null,
      institutionId: null,
      unitId: null,
    }));
  });
});
