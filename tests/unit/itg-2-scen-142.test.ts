import { describe, test, expect, beforeEach } from '@jest/globals';
import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-142
  test('請求書承認検証機能 - 承認者の認証トークンが失効しているとき、トークン検証エラーが発生する', async () => {
    const invoiceId = 'INV-2024-001';
    const approverId = 'approver@example.com';
    const expiredToken = 'expired_token_xyz_12345';

    const mockIdentityProvider = {
      authenticateUser: jest.fn(),
      validateToken: jest.fn().mockRejectedValueOnce(
        new Error(JSON.stringify({
          code: 'TokenExpiredException',
          message: 'Token has expired',
        }))
      ),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    const mockAuditLogger = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    const approvalRequest = {
      invoiceId,
      approverId,
      token: expiredToken,
    };

    const result = await validateInvoiceApproval(
      approvalRequest,
      mockIdentityProvider,
      mockAuditLogger
    );

    expect(result.statusCode).toBe(401);
    expect(result.code).toBe('AUTHENTICATION_FAILED');
    expect(result.message).toBe('トークンが失効しています。再度ログインしてください。');

    expect(mockIdentityProvider.validateToken).toHaveBeenCalledWith(expiredToken);

    expect(mockAuditLogger.logUserAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: approverId,
        eventType: '認証失敗',
        timestamp: expect.any(Date),
      })
    );

    expect(result.invoiceStatusChanged).toBe(false);
  });
});