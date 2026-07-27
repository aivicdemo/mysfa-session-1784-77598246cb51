import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-3';

const fetchMock = require('jest-fetch-mock');

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-134: [error] 請求書承認検証機能 - 承認者が「経理管理者」ロールを保有しないとき、権限エラーが発生する
  test('should return 403 Forbidden when user lacks accounting_manager role for invoice approval', async () => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const invoiceId = 'INV-TEST-001';
    const invoiceAmount = 100000;
    const currentStatus = 'pending_approval';
    const userRole = 'sales_representative';
    const token = 'valid_token_user_123';

    const mockIdentityProvider = {
      authenticateUser: jest.fn(),
      validateToken: jest.fn().mockResolvedValue({
        isValid: true,
        userId: 'user_123',
        token: token,
      }),
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
      invoiceId: invoiceId,
      userId: 'user_123',
      userRole: userRole,
      token: token,
      invoiceStatus: currentStatus,
      invoiceAmount: invoiceAmount,
    };

    const result = await validateInvoiceApproval(
      approvalRequest,
      mockIdentityProvider,
      mockAuditLogger
    );

    expect(result.statusCode).toBe(403);
    expect(result.errorCode).toBe('AUTHORIZATION_DENIED');
    expect(result.message).toMatch(/権限がありません/);
    expect(result.message).toMatch(/経理管理者ロール/);
    expect(result.invoiceStatusUnchanged).toBe(true);
    expect(result.currentInvoiceStatus).toBe(currentStatus);
    expect(mockAuditLogger.logPermissionChange).not.toHaveBeenCalled();
    expect(result.userErrorMessage).toBe('この操作を実行する権限がありません');
  });
});