import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-140
  test('[error] 請求書承認検証機能 - 承認者のセッションが無効なとき、認証エラーが発生する', async () => {
    const approverId = 'approver@example.com';
    const invoiceId = 'INV-2024-001';
    const invalidSessionToken = 'expired-or-tampered-token';

    const mockIdentityProviderAdapter = {
      validateToken: jest.fn().mockResolvedValueOnce({
        isValid: false,
        errorCode: 'SESSION_INVALID',
        message: '認証エラーが発生しました。ログインしてください',
      }),
      authenticateUser: jest.fn(),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    const mockAuditLogExporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    const approvalRequest = {
      approverId,
      invoiceId,
      sessionToken: invalidSessionToken,
      action: 'approve',
    };

    const result = await validateInvoiceApproval(
      approvalRequest,
      mockIdentityProviderAdapter,
      mockAuditLogExporter
    );

    expect(result.statusCode).toBe(401);
    expect(result.errorMessage).toBe('認証エラーが発生しました。ログインしてください');
    expect(result.invoiceApproved).toBe(false);
    expect(mockIdentityProviderAdapter.validateToken).toHaveBeenCalledWith(
      invalidSessionToken
    );
    expect(result.requiresRedirectToLogin).toBe(true);
  });
});