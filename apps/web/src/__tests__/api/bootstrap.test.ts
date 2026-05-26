import { NextRequest } from "next/server";

const mockVerifyIdToken = jest.fn();
const mockSetCustomUserClaims = jest.fn();
const mockExistingQuery = jest.fn();
const mockUserSet = jest.fn();

jest.mock("../../lib/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: mockVerifyIdToken,
    setCustomUserClaims: mockSetCustomUserClaims,
  },
  adminDb: {
    collection: () => ({
      where: () => ({ limit: () => ({ get: mockExistingQuery }) }),
      doc: () => ({ set: mockUserSet }),
    }),
  },
}));

import { POST } from "../../app/api/admin/bootstrap/route";

function makeReq(token?: string): NextRequest {
  return new NextRequest("http://localhost/api/admin/bootstrap", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

beforeEach(() => jest.clearAllMocks());

describe("POST /api/admin/bootstrap", () => {
  it("retorna 401 sem token", async () => {
    const res = await POST(makeReq());
    expect(res.status).toBe(401);
  });

  it("retorna 409 se superadmin já existe", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "u1", email: "a@b.com" });
    mockExistingQuery.mockResolvedValue({ empty: false });

    const res = await POST(makeReq("valid"));
    expect(res.status).toBe(409);
    expect(mockUserSet).not.toHaveBeenCalled();
  });

  it("cria superadmin com product=null quando nenhum existe", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "u1", email: "admin@etz.com", name: "Admin" });
    mockExistingQuery.mockResolvedValue({ empty: true });
    mockUserSet.mockResolvedValue(undefined);
    mockSetCustomUserClaims.mockResolvedValue(undefined);

    const res = await POST(makeReq("valid"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, message: "Superadmin created" });

    expect(mockUserSet).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "superadmin",
        product: null,
        institutionId: null,
        unitId: null,
      }),
      { merge: true }
    );
  });

  it("define claim role=superadmin", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "u1", email: "admin@etz.com" });
    mockExistingQuery.mockResolvedValue({ empty: true });
    mockUserSet.mockResolvedValue(undefined);
    mockSetCustomUserClaims.mockResolvedValue(undefined);

    await POST(makeReq("valid"));

    expect(mockSetCustomUserClaims).toHaveBeenCalledWith("u1", { role: "superadmin" });
  });
});
