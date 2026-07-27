import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-3';

const mockIdentityProvider = {
  authenticateUser: jest.fn(),
  validateToken: jest.fn(),
  refreshToken: jest.fn(),
  revokeSession: jest.fn(),
};

const mockAuditLogExporter = {
  logUserAccess: jest.fn(),
  logDataAccess: jest.fn(),
  logPermissionChange: jest.fn(),
  queryAuditLog: jest.fn(),
};

describe('顧客ポータルのアクセス制御と権限管理', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-135
  test('should reject invoice approval when approver role is sales_representative', () => {
    const approverUser = {
      userId: 'user-001',
      email: 'sales@example.com',
      role: 'sales_representative',
      authToken: 'token-abc-001',
    };

    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      amount: 100000,
      status: 'pending_approval',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    mockIdentityProvider.validateToken.mockReturnValue({
      isValid: true,
      userId: approverUser.userId,
      role: approverUser.role,
    });

    const result = validateInvoiceApproval(
      {
        approverUserId: approverUser.userId,
        approverRole: approverUser.role,
        invoiceId: invoiceData.invoiceId,
        invoiceAmount: invoiceData.amount,
        invoiceStatus: invoiceData.status,
        authToken: approverUser.authToken,
      },
      mockIdentityProvider,
      mockAuditLogExporter
    );

    expect(result).toEqual({
      success: false,
      errorCode: 'UNAUTHORIZED_ROLE',
      errorMessage: 'このロールでは請求書を承認する権限がありません',
      invoiceStatus: 'pending_approval',
    });

    expect(mockAuditLogExporter.logPermissionChange).toHaveBeenCalledWith({
      userId: approverUser.userId,
      operationType: '承認拒否',
      reason: '権限不足（ロール: sales_representative）',
      invoiceId: invoiceData.invoiceId,
      timestamp: expect.any(Date),
    });

    expect(mockIdentityProvider.validateToken).toHaveBeenCalledWith(
      approverUser.authToken
    );
  });
});