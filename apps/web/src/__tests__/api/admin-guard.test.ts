import { NextRequest } from "next/server";

const mockVerifyIdToken = jest.fn();
const mockGet = jest.fn();
const mockAuditAdd = jest.fn();

jest.mock("../../lib/firebase-admin", () => ({
  adminAuth: { verifyIdToken: mockVerifyIdToken },
  adminDb: {
    collection: (col: string) => {
      if (col === "audit_logs") return { add: mockAuditAdd };
      return { doc: () => ({ get: mockGet }) };
    },
  },
}));

import { verifyAdmin, writeAuditLog } from "../../lib/admin-guard";

function makeReq(token?: string): NextRequest {
  return new NextRequest("http://localhost/api/test", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

describe("verifyAdmin", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 401 sem header Authorization", async () => {
    const res = await verifyAdmin(makeReq());
    expect((res as Response).status).toBe(401);
    expect(await (res as Response).json()).toEqual({ error: "Unauthorized" });
  });

  it("retorna 401 com token malformado", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("invalid"));
    const res = await verifyAdmin(makeReq("bad"));
    expect((res as Response).status).toBe(401);
    expect(await (res as Response).json()).toEqual({ error: "Invalid token" });
  });

  it("retorna uid via claim role=superadmin sem consultar Firestore", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "u1", role: "superadmin" });
    const result = await verifyAdmin(makeReq("valid"));
    expect(result).toEqual({ uid: "u1" });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("retorna uid via Firestore quando claim ausente (bootstrap path)", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "u1" });
    mockGet.mockResolvedValue({ exists: true, data: () => ({ role: "superadmin" }) });
    const result = await verifyAdmin(makeReq("valid"));
    expect(result).toEqual({ uid: "u1" });
  });

  it("retorna 403 quando Firestore role não é superadmin", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "u1" });
    mockGet.mockResolvedValue({ exists: true, data: () => ({ role: "gestor" }) });
    const res = await verifyAdmin(makeReq("valid"));
    expect((res as Response).status).toBe(403);
    expect(await (res as Response).json()).toEqual({ error: "Forbidden" });
  });

  it("retorna 403 quando documento não existe no Firestore", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "u1" });
    mockGet.mockResolvedValue({ exists: false, data: () => undefined });
    const res = await verifyAdmin(makeReq("valid"));
    expect((res as Response).status).toBe(403);
  });
});

describe("writeAuditLog", () => {
  beforeEach(() => jest.clearAllMocks());

  it("grava documento com todos os campos obrigatórios", async () => {
    mockAuditAdd.mockResolvedValue({ id: "log1" });

    await writeAuditLog("uid1", "admin@etz.com", "create_user", "user", "target1", { role: "analista" });

    expect(mockAuditAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "uid1",
        userEmail: "admin@etz.com",
        action: "create_user",
        targetType: "user",
        targetId: "target1",
        details: { role: "analista" },
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      })
    );
  });

  it("usa details={} quando omitido", async () => {
    mockAuditAdd.mockResolvedValue({ id: "log2" });

    await writeAuditLog("uid1", "admin@etz.com", "delete_user", "user", "target1");

    expect(mockAuditAdd).toHaveBeenCalledWith(expect.objectContaining({ details: {} }));
  });
});
