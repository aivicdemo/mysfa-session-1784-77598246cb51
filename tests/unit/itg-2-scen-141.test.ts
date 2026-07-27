import { validateInvoiceApprovalToken } from "../../src/logic/it-1784969823049-2-1-3";

describe("顧客ポータルのアクセス制御と権限管理", () => {
  // SCEN-141: [normal] 請求書承認検証機能 - 承認者の認証トークンが有効なとき、トークン検証を成功させる
  test("should successfully validate approver token and return authentication state", () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcHByb3Zlcl8xMjM0NTYiLCJuYW1lIjoiQXBwcm92ZXIgVXNlciIsImlhdCI6MTcwMzAxNjgwMH0.signature";
    const currentTimestamp = 1703016800;
    const expiresAtTimestamp = currentTimestamp + 3600;
    const expiresAt = new Date(expiresAtTimestamp * 1000).toISOString();

    const mockIdentityProviderAdapter = {
      validateToken: jest.fn().mockResolvedValue({
        userId: "approver_123456",
        role: "approver",
        expiresAt: expiresAt,
        isValid: true,
      }),
    };

    const result = validateInvoiceApprovalToken(token, mockIdentityProviderAdapter);

    expect(mockIdentityProviderAdapter.validateToken).toHaveBeenCalledTimes(1);
    expect(mockIdentityProviderAdapter.validateToken).toHaveBeenCalledWith(token);

    return result.then((response) => {
      expect(response).toEqual({
        userId: "approver_123456",
        role: "approver",
        expiresAt: expiresAt,
        isValid: true,
      });
      expect(response.userId).toBe("approver_123456");
      expect(response.role).toBe("approver");
      expect(response.isValid).toBe(true);
    });
  });
});