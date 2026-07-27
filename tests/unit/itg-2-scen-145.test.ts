import { approveInvoiceWithAudit } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-145: [normal] 請求書承認検証機能 - 承認操作がAuditLogExporterで正常に記録されるとき、検証を成功させる
  test('承認操作がAuditLogExporterで正常に記録される', () => {
    const userId = 'user-12345';
    const invoiceId = 'invoice-67890';
    const operationTimestamp = new Date('2024-01-15T14:30:00Z');
    const invoiceApprovalData = {
      invoiceId: invoiceId,
      customerId: 'customer-98765',
      amount: 150000,
      status: 'pending_approval',
      createdAt: new Date('2024-01-10T09:00:00Z'),
    };

    const auditLogRecords: Array<{
      userId: string;
      operationType: string;
      targetInvoiceId: string;
      operationTimestamp: Date;
      executedAt: Date;
    }> = [];

    const mockAuditLogExporter = {
      logDataAccess: jest.fn((params: {
        userId: string;
        operationType: string;
        targetInvoiceId: string;
        operationTimestamp: Date;
        executedAt: Date;
      }) => {
        auditLogRecords.push(params);
        return Promise.resolve({ success: true });
      }),
      queryAuditLog: jest.fn((query: {
        userId: string;
        operationType: string;
        targetInvoiceId?: string;
      }) => {
        return Promise.resolve(
          auditLogRecords.filter(
            (record) =>
              record.userId === query.userId &&
              record.operationType === query.operationType &&
              (!query.targetInvoiceId ||
                record.targetInvoiceId === query.targetInvoiceId)
          )
        );
      }),
    };

    const approvalResult = approveInvoiceWithAudit(
      userId,
      invoiceId,
      invoiceApprovalData,
      mockAuditLogExporter
    );

    expect(approvalResult).toEqual({
      success: true,
      invoiceId: invoiceId,
      approvedBy: userId,
      approvedAt: expect.any(Date),
    });

    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledTimes(1);

    const callArgs = mockAuditLogExporter.logDataAccess.mock.calls[0][0];
    expect(callArgs.userId).toBe(userId);
    expect(callArgs.operationType).toBe('承認');
    expect(callArgs.targetInvoiceId).toBe(invoiceId);
    expect(callArgs.operationTimestamp).toBeInstanceOf(Date);
    expect(callArgs.executedAt).toBeInstanceOf(Date);

    const queryParams = {
      userId: userId,
      operationType: '承認',
      targetInvoiceId: invoiceId,
    };

    return mockAuditLogExporter.queryAuditLog(queryParams).then((results) => {
      expect(results).toHaveLength(1);
      expect(results[0].userId).toBe(userId);
      expect(results[0].operationType).toBe('承認');
      expect(results[0].targetInvoiceId).toBe(invoiceId);
      expect(results[0].operationTimestamp).toBeInstanceOf(Date);
      expect(results[0].executedAt).toBeInstanceOf(Date);
    });
  });
});