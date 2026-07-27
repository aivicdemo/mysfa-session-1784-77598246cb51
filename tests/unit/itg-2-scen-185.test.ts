import { validatePortalAccess } from "../../src/logic/it-1784969823049-2-1-3";

interface IdentityProviderAdapter {
  validateToken: (token: string) => Promise<{ valid: boolean; userId?: string }>;
}

describe("顧客ポータルのアクセス制御と権限管理", () => {
  // SCEN-185
  test("validateTokenが失敗した場合、ポータルへのアクセスが制限される", async () => {
    const mockIdentityProvider: IdentityProviderAdapter = {
      validateToken: jest.fn().mockRejectedValueOnce(
        new Error("InvalidTokenException")
      ),
    };

    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_token_string";

    const result = await validatePortalAccess(accessToken, mockIdentityProvider);

    expect(result.statusCode).toBe(401);
    expect(result.message).toMatch(/認証サービス/);
    expect(result.redirectUrl).toBe("/login");
    expect(result.sessionValid).toBe(false);
    expect(mockIdentityProvider.validateToken).toHaveBeenCalledWith(accessToken);
  });
});