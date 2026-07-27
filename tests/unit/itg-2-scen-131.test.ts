import { validateApprovalAuthority } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-131: [normal] 請求書承認検証機能 - 承認者の権限情報が存在するとき、権限チェックを成功させる
  test('should validate approval authority successfully when approver has valid permissions', async () => {
    const approverUserId = 'approver_001';
    const approverToken = 'mock-token-approver-001';
    const invoiceAmount = 3000000; // 300万円
    const approverLimitAmount = 5000000; // 500万円
    const approverRole = '請求書承認者';
    const approverDepartment = '営業部';
    const checkTimestamp = new Date('2024-01-15T11:00:00Z');

    // Mock IdentityProviderAdapter
    const mockIdentityProviderAdapter = {
      authenticateUser: jest.fn().mockResolvedValue({
        token: approverToken,
        userId: approverUserId,
      }),
      validateToken: jest.fn().mockResolvedValue({
        valid: true,
        userId: approverUserId,
      }),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    // Mock AuditLogExporter
    const mockAuditLogExporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn().mockResolvedValue({
        success: true,
      }),
      queryAuditLog: jest.fn(),
    };

    // Mock database user permission retrieval
    const mockUserPermissionRepository = {
      findByUserId: jest.fn().mockResolvedValue({
        userId: approverUserId,
        role: approverRole,
        department: approverDepartment,
        approvalLimitAmount: approverLimitAmount,
      }),
    };

    // Prepare invoice info
    const invoiceInfo = {
      invoiceId: 'INV-2024-001',
      amount: invoiceAmount,
      customerId: 'CUST-12345',
      issueDate: '2024-01-10',
    };

    // Call the validation function
    const result = await validateApprovalAuthority(
      approverToken,
      invoiceInfo,
      {
        identityProvider: mockIdentityProviderAdapter,
        auditLogger: mockAuditLogExporter,
        userPermissionRepository: mockUserPermissionRepository,
        currentTimestamp: checkTimestamp,
      }
    );

    // Verify success status
    expect(result.success).toBe(true);

    // Verify user role
    expect(result.userRole).toBe(approverRole);

    // Verify approval limit check (invoice amount <= approval limit)
    expect(invoiceAmount).toBeLessThanOrEqual(approverLimitAmount);
    expect(result.isWithinApprovalLimit).toBe(true);

    // Verify audit log was called with correct parameters
    expect(mockAuditLogExporter.logPermissionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: approverUserId,
        actionType: 'APPROVAL_AUTHORITY_CHECK',
        timestamp: checkTimestamp,
        result: 'SUCCESS',
        invoiceId: invoiceInfo.invoiceId,
        invoiceAmount: invoiceAmount,
        approvalLimit: approverLimitAmount,
      })
    );

    // Verify audit log call count
    expect(mockAuditLogExporter.logPermissionChange).toHaveBeenCalledTimes(1);
  });
});