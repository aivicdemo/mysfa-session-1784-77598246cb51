import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { publishInvoiceWithHistory } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  let mockDocumentStorage: any;
  let mockNotificationService: any;
  let mockPaymentGateway: any;
  let mockDateProvider: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-20240115-001',
        url: 'https://storage.example.com/documents/DOC-20240115-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/s/abc123xyz',
        expiresAt: '2024-01-16T14:30:45Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    mockNotificationService = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-20240115-001',
        sentAt: '2024-01-15T14:30:45Z',
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'DELIVERED',
      }),
    };

    mockPaymentGateway = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/pay/inv-20240115-001',
        expiresAt: '2024-02-15T14:30:45Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        status: 'COMPLETED',
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'SUCCESS',
      }),
    };

    mockDateProvider = {
      getCurrentDate: jest.fn().mockReturnValue(
        new Date('2024-01-15T14:30:45Z')
      ),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // SCEN-044
  test('帳票発行時の発行日時自動付与と発行履歴記録 - 請求書の発行履歴がシステムに1件記録される', async () => {
    const customerId = 'CUST-001';
    const customerName = 'テスト太郎';
    const invoiceAmount = 100000;
    const invoiceId = 'INV-20240115-001';
    const invoiceTaxRate = 0.1;
    const expectedIssuedAt = new Date('2024-01-15T14:30:45Z');
    const expectedStatus = 'ISSUED';
    const userId = 'USER-001';

    const invoiceInput = {
      invoiceId,
      customerId,
      customerName,
      amount: invoiceAmount,
      taxRate: invoiceTaxRate,
      items: [
        {
          itemId: 'ITEM-001',
          description: '商品A',
          quantity: 1,
          unitPrice: 100000,
          isTaxTarget: true,
        },
      ],
      issuedBy: userId,
      documentStorageAdapter: mockDocumentStorage,
      notificationServiceAdapter: mockNotificationService,
      paymentGatewayAdapter: mockPaymentGateway,
      dateProvider: mockDateProvider,
    };

    const result = await publishInvoiceWithHistory(invoiceInput);

    expect(result).toBeDefined();
    expect(result.historyRecords).toBeDefined();
    expect(result.historyRecords).toHaveLength(1);

    const historyRecord = result.historyRecords[0];

    expect(historyRecord.customerId).toBe('CUST-001');
    expect(historyRecord.invoiceId).toBe('INV-20240115-001');
    expect(historyRecord.issuedAt).toEqual(expectedIssuedAt);
    expect(historyRecord.status).toBe('ISSUED');
    expect(historyRecord.issuedBy).toBe('USER-001');
    expect(historyRecord.updatedAt).toBeDefined();
    expect(historyRecord.documentId).toBe('DOC-20240115-001');

    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId,
        customerId,
      })
    );

    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId,
        invoiceId,
      })
    );

    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId,
        amount: invoiceAmount,
      })
    );

    expect(result.paymentLink).toBe(
      'https://payment.example.com/pay/inv-20240115-001'
    );
  });
});