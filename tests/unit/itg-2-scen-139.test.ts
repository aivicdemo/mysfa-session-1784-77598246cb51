import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-139
  test('[normal] 請求書承認検証機能 - 承認者のセッションが有効なとき、検証を実行可能にする', async () => {
    const approverEmail = 'approver@company.com';
    const validSessionToken = 'valid_token_12345';
    const invoiceId = 'INV-2024-001';
    const invoiceAmount = 100000;
    const initialStatus = '承認待ち';
    const expectedApprovedStatus = '承認済み';
    const approverId = 'user_approver_001';
    const approverPermissions = ['invoice_approve'];

    const mockIdentityProviderAdapter = {
      authenticateUser: jest.fn(),
      validateToken: jest.fn().mockResolvedValue({
        isValid: true,
        userId: approverId,
        email: approverEmail,
        permissions: approverPermissions,
      }),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    const mockAuditLogExporter = {
      logUserAccess: jest.fn().mockResolvedValue(undefined),
      logDataAccess: jest.fn().mockResolvedValue(undefined),
      logPermissionChange: jest.fn().mockResolvedValue(undefined),
      queryAuditLog: jest.fn(),
    };

    const invoiceDataBeforeApproval = {
      invoiceId: invoiceId,
      customerId: 'cust_001',
      amount: invoiceAmount,
      status: initialStatus,
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const result = await validateInvoiceApproval(
      {
        sessionToken: validSessionToken,
        invoiceId: invoiceId,
        approverEmail: approverEmail,
        invoiceData: invoiceDataBeforeApproval,
      },
      mockIdentityProviderAdapter,
      mockAuditLogExporter
    );

    expect(mockIdentityProviderAdapter.validateToken).toHaveBeenCalledWith(
      validSessionToken
    );

    expect(mockIdentityProviderAdapter.validateToken).toHaveBeenCalledTimes(1);

    expect(result.isTokenValid).toBe(true);
    expect(result.approverUserId).toBe(approverId);
    expect(result.approverEmail).toBe(approverEmail);

    expect(result.invoiceApprovalResult.invoiceId).toBe(invoiceId);
    expect(result.invoiceApprovalResult.status).toBe(expectedApprovedStatus);
    expect(result.invoiceApprovalResult.approvedBy).toBe(approverId);
    expect(result.invoiceApprovalResult.approvedAt).toBeDefined();

    expect(mockAuditLogExporter.logUserAccess).toHaveBeenCalledWith({
      userId: approverId,
      email: approverEmail,
      action: 'invoice_approval',
      invoiceId: invoiceId,
      timestamp: expect.any(Date),
    });

    expect(mockAuditLogExporter.logUserAccess).toHaveBeenCalledTimes(1);

    expect(result.isApprovalSuccessful).toBe(true);
  });
});