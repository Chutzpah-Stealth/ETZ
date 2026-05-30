import { NextRequest } from "next/server";

const mockVerifyIdToken = jest.fn();
const mockCreateUser = jest.fn();
const mockSetCustomUserClaims = jest.fn();
const mockUsersGet = jest.fn();
const mockInstGet = jest.fn();
const mockUsersSet = jest.fn();
const mockAuditAdd = jest.fn();

jest.mock("../../lib/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: mockVerifyIdToken,
    createUser: mockCreateUser,
    setCustomUserClaims: mockSetCustomUserClaims,
  },
  adminDb: {
    collection: (col: string) => {
      if (col === "institutions") return { doc: () => ({ get: mockInstGet }) };
      if (col === "audit_logs")  return { add: mockAuditAdd };
      return {
        doc: () => ({ get: mockUsersGet, set: mockUsersSet }),
        orderBy: () => ({ get: jest.fn().mockResolvedValue({ docs: [] }) }),
      };
    },
  },
}));

import { POST } from "../../app/api/admin/users/route";

function makeReq(body: object): NextRequest {
  return new NextRequest("http://localhost/api/admin/users", {
    method: "POST",
    headers: { Authorization: "Bearer valid", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifyIdToken.mockResolvedValue({ uid: "admin1", role: "superadmin" });
  mockUsersGet.mockResolvedValue({ exists: true, data: () => ({ email: "admin@etz.com" }) });
  mockAuditAdd.mockResolvedValue({});
  mockUsersSet.mockResolvedValue({});
});

describe("POST /api/admin/users", () => {
  it("retorna 400 se email ausente", async () => {
    const res = await POST(makeReq({ password: "123456", role: "analista", institutionId: "i1" }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 se password ausente", async () => {
    const res = await POST(makeReq({ email: "a@b.com", role: "analista", institutionId: "i1" }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 se role ausente", async () => {
    const res = await POST(makeReq({ email: "a@b.com", password: "123456", institutionId: "i1" }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 se não-superadmin sem institutionId", async () => {
    const res = await POST(makeReq({ email: "a@b.com", password: "123456", role: "analista" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/institutionId/);
  });

  it("retorna 400 se institutionId não existe no Firestore", async () => {
    mockInstGet.mockResolvedValue({ exists: false });
    const res = await POST(makeReq({ email: "a@b.com", password: "123456", role: "analista", institutionId: "naoexiste" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Instituição não encontrada" });
  });

  it("cria usuário Defense com product derivado da instituição", async () => {
    mockInstGet.mockResolvedValue({ exists: true, data: () => ({ product: "defense" }) });
    mockCreateUser.mockResolvedValue({ uid: "newuser1" });
    mockSetCustomUserClaims.mockResolvedValue(undefined);

    const res = await POST(makeReq({ email: "a@b.com", password: "123456", role: "analista", institutionId: "inst-defense" }));
    expect(res.status).toBe(201);

    expect(mockSetCustomUserClaims).toHaveBeenCalledWith("newuser1", expect.objectContaining({ product: "defense" }));
    expect(mockUsersSet).toHaveBeenCalledWith(expect.objectContaining({ product: "defense" }));
  });

  it("ignora product enviado no body — usa produto da instituição", async () => {
    mockInstGet.mockResolvedValue({ exists: true, data: () => ({ product: "defense" }) });
    mockCreateUser.mockResolvedValue({ uid: "newuser3" });
    mockSetCustomUserClaims.mockResolvedValue(undefined);

    await POST(makeReq({ email: "c@b.com", password: "123456", role: "analista", institutionId: "inst-defense", product: "business" }));

    expect(mockUsersSet).toHaveBeenCalledWith(expect.objectContaining({ product: "defense" }));
  });

  it("superadmin criado com product/institutionId/unitId null sem consultar Firestore de instituição", async () => {
    mockCreateUser.mockResolvedValue({ uid: "superuser1" });
    mockSetCustomUserClaims.mockResolvedValue(undefined);

    const res = await POST(makeReq({ email: "super@etz.com", password: "123456", role: "superadmin", institutionId: "qualquer" }));
    expect(res.status).toBe(201);

    expect(mockInstGet).not.toHaveBeenCalled();
    expect(mockUsersSet).toHaveBeenCalledWith(expect.objectContaining({
      product: null,
      institutionId: null,
      unitId: null,
    }));
  });

  it("grava audit log com action=create_user e details.product", async () => {
    mockInstGet.mockResolvedValue({ exists: true, data: () => ({ product: "defense" }) });
    mockCreateUser.mockResolvedValue({ uid: "newuser4" });
    mockSetCustomUserClaims.mockResolvedValue(undefined);

    await POST(makeReq({ email: "d@b.com", password: "123456", role: "gestor", institutionId: "inst-defense" }));

    expect(mockAuditAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "create_user",
        details: expect.objectContaining({ product: "defense" }),
      })
    );
  });
});
