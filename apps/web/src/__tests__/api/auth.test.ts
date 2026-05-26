const mockSignInWithEmailAndPassword = jest.fn();
const mockFirebaseSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockAuth = {};

jest.mock("../../lib/firebase", () => ({ auth: mockAuth }));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => mockFirebaseSignOut(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

import { signIn, signOut, onAuthChange } from "../../lib/auth";

beforeEach(() => jest.clearAllMocks());

describe("signIn", () => {
  it("retorna o usuário em caso de sucesso", async () => {
    const fakeUser = { uid: "u1", email: "a@b.com" };
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: fakeUser });

    const user = await signIn("a@b.com", "123456");

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, "a@b.com", "123456");
    expect(user).toBe(fakeUser);
  });

  it("propaga FirebaseError sem engolir", async () => {
    const err = Object.assign(new Error("auth/wrong-password"), { code: "auth/wrong-password" });
    mockSignInWithEmailAndPassword.mockRejectedValue(err);

    await expect(signIn("a@b.com", "errada")).rejects.toThrow("auth/wrong-password");
  });

  it("propaga erro de conta desativada", async () => {
    const err = Object.assign(new Error("auth/user-disabled"), { code: "auth/user-disabled" });
    mockSignInWithEmailAndPassword.mockRejectedValue(err);

    await expect(signIn("a@b.com", "123456")).rejects.toThrow("auth/user-disabled");
  });
});

describe("signOut", () => {
  it("chama firebaseSignOut com a instância de auth correta", async () => {
    mockFirebaseSignOut.mockResolvedValue(undefined);
    await signOut();
    expect(mockFirebaseSignOut).toHaveBeenCalledWith(mockAuth);
  });
});

describe("onAuthChange", () => {
  it("registra listener via onAuthStateChanged e retorna unsubscribe", () => {
    const unsubscribe = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    const cb = jest.fn();
    const result = onAuthChange(cb);

    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, cb);
    expect(result).toBe(unsubscribe);
  });
});
