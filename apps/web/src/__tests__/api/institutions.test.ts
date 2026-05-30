import { NextRequest } from "next/server";

const mockVerifyIdToken = jest.fn();
const mockInstAdd = jest.fn();
const mockCallerGet = jest.fn();
const mockAuditAdd = jest.fn();

jest.mock("../../lib/firebase-admin", () => ({
  adminAuth: { verifyIdToken: mockVerifyIdToken },
  adminDb: {
    collection: (col: string) => {
      if (col === "audit_logs") return { add: mockAuditAdd };
      if (col === "institutions") return { add: mockInstAdd, orderBy: () => ({ get: jest.fn().mockResolvedValue({ docs: [] }) }) };
      return { doc: () => ({ get: mockCallerGet }) };
    },
  },
}));

import { POST } from "../../app/api/admin/institutions/route";

function makeReq(body: object): NextRequest {
  return new NextRequest("http://localhost/api/admin/institutions", {
    method: "POST",
    headers: { Authorization: "Bearer valid", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifyIdToken.mockResolvedValue({ uid: "admin1", role: "superadmin" });
  mockCallerGet.mockResolvedValue({ exists: true, data: () => ({ email: "admin@etz.com" }) });
  mockInstAdd.mockResolvedValue({ id: "inst-new" });
  mockAuditAdd.mockResolvedValue({});
});

describe("POST /api/admin/institutions", () => {
  it("retorna 400 se name ausente", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "name é obrigatório" });
  });

  it("cria instituição com status active e product defense", async () => {
    const res = await POST(makeReq({ name: "PCSP" }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "inst-new" });

    expect(mockInstAdd).toHaveBeenCalledWith(expect.objectContaining({
      name: "PCSP",
      product: "defense",
      status: "active",
      createdBy: "admin1",
    }));
  });

  it("grava audit log com details.product", async () => {
    await POST(makeReq({ name: "PMSP" }));
    expect(mockAuditAdd).toHaveBeenCalledWith(expect.objectContaining({
      action: "create_institution",
      details: expect.objectContaining({ name: "PMSP", product: "defense" }),
    }));
  });
});
