import { validateAndAuthorizePortalAccess } from "../../src/logic/it-1784969823049-2-1-3";

describe("顧客ポータルのアクセス制御と権限管理", () => {
  // SCEN-179
  test("Amazon Cognito連携 - validateTokenが成功応答を返した場合、ポータルアクセス時にトークンの有効性が確認され アクセスが許可される", async () => {
    // Arrange: IdentityProviderAdapterのモック設定
    const mockIdentityProvider = {
      validateToken: jest.fn().mockResolvedValue({
        isValid: true,
        userId: "user-12345",
        userRole: "customer_admin",
        permissions: ["view_deals", "download_documents", "manage_users"],
        expiresAt: "2025-12-31T23:59:59Z",
      }),
      authenticateUser: jest.fn(),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid.token";
    const requestHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };

    // Act: ポータルアクセスエンドポイントへリクエストを送信
    const result = await validateAndAuthorizePortalAccess(
      accessToken,
      mockIdentityProvider
    );

    // Assert: validateTokenが呼び出されたことを確認
    expect(mockIdentityProvider.validateToken).toHaveBeenCalledWith(accessToken);
    expect(mockIdentityProvider.validateToken).toHaveBeenCalledTimes(1);

    // Assert: HTTPステータス200とアクセス許可を確認
    expect(result.httpStatus).toBe(200);
    expect(result.isAccessGranted).toBe(true);

    // Assert: セッション情報が正しく設定されていることを確認
    expect(result.session).toBeDefined();
    expect(result.session.userId).toBe("user-12345");
    expect(result.session.userRole).toBe("customer_admin");
    expect(result.session.permissions).toEqual([
      "view_deals",
      "download_documents",
      "manage_users",
    ]);

    // Assert: ダッシュボード画面が返されることを確認
    expect(result.dashboardContent).toBeDefined();
    expect(result.dashboardContent.pageTitle).toBe("ポータルダッシュボード");
  });
});