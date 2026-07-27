import { validateInvoiceForApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-096
  test('請求書の金額が0のとき、検証エラーが発生する', () => {
    const mockAuditLogger = {
      logDataAccess: jest.fn(),
    };

    const invoiceData = {
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      invoiceDate: new Date('2024-01-15T09:00:00Z'),
      dueDate: new Date('2024-02-15T09:00:00Z'),
      lineItems: [
        {
          itemName: '商品A',
          quantity: 0,
          unitPrice: 10000,
        },
      ],
      totalAmount: 0,
    };

    expect(() => {
      validateInvoiceForApproval(invoiceData, mockAuditLogger);
    }).toThrow(/金額|金額/);

    expect(mockAuditLogger.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'INVOICE_VALIDATION_FAILED',
        invoiceId: expect.any(String),
        reason: expect.stringContaining('金額'),
      })
    );
  });
});