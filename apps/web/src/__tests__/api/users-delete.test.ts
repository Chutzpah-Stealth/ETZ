import { NextRequest } from "next/server";

const mockVerifyIdToken = jest.fn();
const mockDeleteUser = jest.fn();
const mockUserDelete = jest.fn();
const mockAuditAdd = jest.fn();

jest.mock("../../lib/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: mockVerifyIdToken,
    deleteUser: mockDeleteUser,
  },
  adminDb: {
    collection: (col: string) => {
      if (col === "audit_logs") return { add: mockAuditAdd };
      return {
        doc: (uid: string) => ({
          get: uid === "caller1"
            ? jest.fn().mockResolvedValue({ exists: true, data: () => ({ email: "admin@etz.com" }) })
            : jest.fn().mockResolvedValue({ exists: true, data: () => ({ email: "user@etz.com" }) }),
          delete: mockUserDelete,
        }),
      };
    },
  },
}));

import { DELETE } from "../../app/api/admin/users/[uid]/route";

function makeReq(uid: string): NextRequest {
  return new NextRequest(`http://localhost/api/admin/users/${uid}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer valid" },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifyIdToken.mockResolvedValue({ uid: "caller1", role: "superadmin" });
  mockDeleteUser.mockResolvedValue(undefined);
  mockUserDelete.mockResolvedValue(undefined);
  mockAuditAdd.mockResolvedValue({});
});

describe("DELETE /api/admin/users/[uid]", () => {
  it("remove usuário do Firebase Auth", async () => {
    const res = await DELETE(makeReq("u1"), { params: Promise.resolve({ uid: "u1" }) });
    expect(res.status).toBe(200);
    expect(mockDeleteUser).toHaveBeenCalledWith("u1");
  });

  it("remove documento do Firestore", async () => {
    await DELETE(makeReq("u1"), { params: Promise.resolve({ uid: "u1" }) });
    expect(mockUserDelete).toHaveBeenCalled();
  });

  it("grava audit log com action=delete_user", async () => {
    await DELETE(makeReq("u1"), { params: Promise.resolve({ uid: "u1" }) });

    expect(mockAuditAdd).toHaveBeenCalledWith(expect.objectContaining({
      action: "delete_user",
      targetType: "user",
      targetId: "u1",
      details: {},
    }));
  });

  it("retorna 401 sem token", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("invalid"));
    const res = await DELETE(
      new NextRequest("http://localhost/api/admin/users/u1", { method: "DELETE" }),
      { params: Promise.resolve({ uid: "u1" }) }
    );
    expect(res.status).toBe(401);
  });
});
