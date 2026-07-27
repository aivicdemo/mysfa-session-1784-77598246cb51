import { validateInvoiceForApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-914
  test('請求書が差戻し済みのとき、再検証で同じ結果が得られる', () => {
    const invoiceId = 'INV-2024-001';
    const customerId = 'CUST-0001';
    const customerName = 'テスト顧客株式会社';
    const amount = 110000;
    const taxAmount = 10000;
    const totalAmount = 120000;

    const invoiceItem1 = {
      itemId: 'ITEM-001',
      productName: '商品A',
      quantity: 10,
      unitPrice: 10000,
      lineAmount: 100000,
    };

    const invoiceItem2 = {
      itemId: 'ITEM-002',
      productName: '商品B',
      quantity: 0,
      unitPrice: 5000,
      lineAmount: 0,
    };

    const invoiceData = {
      invoiceId,
      customerId,
      customerName,
      amount,
      taxAmount,
      totalAmount,
      invoiceDate: '2024-04-15',
      dueDate: '2024-05-15',
      items: [invoiceItem1, invoiceItem2],
    };

    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'FILE-001',
        url: 'https://storage.example.com/invoices/INV-2024-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/token-abc123',
      }),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-001',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-002',
        status: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-003',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: '2024-04-16T10:30:00Z',
      }),
    };

    const firstValidationResult = validateInvoiceForApproval(
      invoiceData,
      documentStorageAdapterStub,
      notificationServiceAdapterStub
    );

    expect(firstValidationResult.isValid).toBe(false);
    expect(firstValidationResult.status).toBe('rejected');
    expect(firstValidationResult.errors).toContainEqual(
      expect.objectContaining({
        field: 'items',
        errorCode: 'ZERO_QUANTITY_ITEM',
        message: expect.stringContaining('ITEM-002'),
      })
    );

    const rejectionReason = 'ゼロ数量の商品が検出されたため差戻し';
    const rejectedAtTimestamp = '2024-04-15T14:00:00Z';

    const rejectedInvoiceData = {
      ...invoiceData,
      invoiceStatus: 'rejected',
      rejectedReason: rejectionReason,
      rejectedAt: rejectedAtTimestamp,
      rejectionCount: 1,
    };

    const secondValidationResult = validateInvoiceForApproval(
      rejectedInvoiceData,
      documentStorageAdapterStub,
      notificationServiceAdapterStub
    );

    expect(secondValidationResult.isValid).toBe(false);
    expect(secondValidationResult.status).toBe('rejected');
    expect(secondValidationResult.errors.length).toBe(
      firstValidationResult.errors.length
    );

    expect(secondValidationResult.errors).toEqual(
      firstValidationResult.errors.map((error) => ({
        ...error,
      }))
    );

    expect(secondValidationResult.invoiceStatus).toBe('rejected');
    expect(secondValidationResult.validationHistory.length).toBe(2);

    const firstValidationRecord = secondValidationResult.validationHistory[0];
    const secondValidationRecord = secondValidationResult.validationHistory[1];

    expect(firstValidationRecord.validationOrder).toBe(1);
    expect(firstValidationRecord.executedAt).toBeDefined();
    expect(firstValidationRecord.errorCount).toBe(1);

    expect(secondValidationRecord.validationOrder).toBe(2);
    expect(secondValidationRecord.executedAt).toBeDefined();
    expect(secondValidationRecord.executedAt).not.toBe(
      firstValidationRecord.executedAt
    );
    expect(secondValidationRecord.errorCount).toBe(1);

    expect(secondValidationRecord.errorDetails).toEqual(
      firstValidationRecord.errorDetails
    );

    expect(secondValidationResult.businessJudgment).toBe(
      firstValidationResult.businessJudgment
    );
  });
});