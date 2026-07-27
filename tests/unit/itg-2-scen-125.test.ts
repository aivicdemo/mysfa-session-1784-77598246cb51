import { approveInvoice } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-125
  test('請求書のステータスが「承認済み」のとき、重複承認エラーを発生させる', async () => {
    const mockCurrentTimestamp = new Date('2024-01-15T11:45:00Z');
    const mockInvoiceId = 'INV-001';
    const mockUserId = 'USER-B';
    const mockApprovedAt = new Date('2024-01-15T10:30:00Z');
    const mockApproverUserId = 'USER-A';
    const mockInvoiceAmount = 100000;

    const mockIdentityProvider = {
      authenticateUser: jest.fn().mockResolvedValue({
        token: 'valid-session-token-xyz',
        userId: mockUserId,
        expiresAt: new Date(Date.now() + 3600000),
      }),
      validateToken: jest.fn().mockResolvedValue(true),
      refreshToken: jest.fn().mockResolvedValue('refreshed-token'),
      revokeSession: jest.fn().mockResolvedValue(undefined),
    };

    const mockInvoiceRepository = {
      getById: jest.fn().mockResolvedValue({
        invoiceId: mockInvoiceId,
        status: '承認済み',
        amount: mockInvoiceAmount,
        approvedAt: mockApprovedAt,
        approverUserId: mockApproverUserId,
      }),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };

    const mockAuditLogger = {
      logUserAccess: jest.fn().mockResolvedValue(undefined),
      logDataAccess: jest.fn().mockResolvedValue(undefined),
      logPermissionChange: jest.fn().mockResolvedValue(undefined),
      queryAuditLog: jest.fn().mockResolvedValue([]),
      logDuplicateApprovalError: jest.fn().mockResolvedValue(undefined),
    };

    const approveInvoiceRequest = {
      invoiceId: mockInvoiceId,
      userId: mockUserId,
      currentTimestamp: mockCurrentTimestamp,
    };

    const result = await approveInvoice(
      approveInvoiceRequest,
      mockIdentityProvider,
      mockInvoiceRepository,
      mockAuditLogger
    );

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('DUPLICATE_APPROVAL_ERROR');
    expect(result.errorMessage).toMatch(/既に承認済み/);
    expect(result.invoiceStatus).toBe('承認済み');
    expect(result.approvedAtTimestamp).toEqual(mockApprovedAt);

    expect(mockInvoiceRepository.updateStatus).not.toHaveBeenCalled();

    expect(mockAuditLogger.logDuplicateApprovalError).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: mockInvoiceId,
        userId: mockUserId,
        timestamp: mockCurrentTimestamp,
      })
    );
  });
});