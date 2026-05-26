import { NextRequest } from "next/server";

const mockVerifyIdToken = jest.fn();
const mockUnitsAdd = jest.fn();
const mockCallerGet = jest.fn();
const mockInstGet = jest.fn();
const mockAuditAdd = jest.fn();

jest.mock("../../lib/firebase-admin", () => ({
  adminAuth: { verifyIdToken: mockVerifyIdToken },
  adminDb: {
    collection: (col: string) => {
      if (col === "audit_logs") return { add: mockAuditAdd };
      if (col === "users")       return { doc: () => ({ get: mockCallerGet }) };
      if (col === "institutions") {
        return {
          doc: () => ({
            get: mockInstGet,
            collection: () => ({ add: mockUnitsAdd }),
          }),
        };
      }
      return {};
    },
  },
}));

import { POST } from "../../app/api/admin/institutions/[id]/units/route";

function makeReq(body: object): NextRequest {
  return new NextRequest("http://localhost/api/admin/institutions/inst1/units", {
    method: "POST",
    headers: { Authorization: "Bearer valid", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifyIdToken.mockResolvedValue({ uid: "admin1", role: "superadmin" });
  mockCallerGet.mockResolvedValue({ exists: true, data: () => ({ email: "admin@etz.com" }) });
  mockInstGet.mockResolvedValue({ exists: true, data: () => ({ product: "defense" }) });
  mockUnitsAdd.mockResolvedValue({ id: "unit-new" });
  mockAuditAdd.mockResolvedValue({});
});

describe("POST /api/admin/institutions/[id]/units", () => {
  it("retorna 400 se name ausente", async () => {
    const res = await POST(makeReq({}), { params: Promise.resolve({ id: "inst1" }) });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "name é obrigatório" });
  });

  it("cria unidade com campos corretos", async () => {
    const res = await POST(makeReq({ name: "Delegacia Centro" }), { params: Promise.resolve({ id: "inst1" }) });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "unit-new" });

    expect(mockUnitsAdd).toHaveBeenCalledWith(expect.objectContaining({
      name: "Delegacia Centro",
      institutionId: "inst1",
      status: "active",
    }));
  });

  it("grava audit log com product da instituição pai", async () => {
    await POST(makeReq({ name: "Delegacia Norte" }), { params: Promise.resolve({ id: "inst1" }) });

    expect(mockAuditAdd).toHaveBeenCalledWith(expect.objectContaining({
      action: "create_unit",
      targetType: "unit",
      details: expect.objectContaining({
        name: "Delegacia Norte",
        institutionId: "inst1",
        product: "defense",
      }),
    }));
  });

  it("grava product=null quando instituição não tem campo product", async () => {
    mockInstGet.mockResolvedValue({ exists: true, data: () => ({}) });

    await POST(makeReq({ name: "Unidade Sem Produto" }), { params: Promise.resolve({ id: "inst1" }) });

    expect(mockAuditAdd).toHaveBeenCalledWith(
      expect.objectContaining({ details: expect.objectContaining({ product: null }) })
    );
  });
});
