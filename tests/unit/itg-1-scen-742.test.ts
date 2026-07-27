import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { reconcileDealAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let mockDocumentStorageAdapter: any;
  let mockNotificationServiceAdapter: any;
  let mockPaymentGatewayAdapter: any;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-12345',
        storageUrl: 'https://storage.example.com/DOC-12345',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/token-abc123',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-001',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-002',
        status: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-003',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: new Date('2024-12-20T10:30:00Z'),
      }),
    };

    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/link-xyz789',
        expiresAt: new Date('2024-12-25T23:59:59Z'),
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: 'TXN-999888',
        status: 'completed',
        verifiedAt: new Date('2024-12-20T15:45:00Z'),
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: 'TXN-999888',
        status: 'completed',
        amount: 500000,
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-742
  test('商談ステータス・請求データ照合機能 - 商談レコードに紐付く請求書が1件の場合、照合が実行される', async () => {
    const testDeal = {
      dealId: 'DEAL-001',
      status: '提案中',
      amount: 500000,
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      salesPersonId: 'SALES-001',
      createdAt: new Date('2024-12-01T09:00:00Z'),
    };

    const testInvoice = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      amount: 500000,
      status: '未請求',
      customerId: 'CUST-001',
      invoiceDate: new Date('2024-12-15T00:00:00Z'),
      dueDate: new Date('2024-12-31T23:59:59Z'),
    };

    const reconciliationResult = await reconcileDealAndInvoice(
      testDeal,
      [testInvoice],
      {
        documentStorageAdapter: mockDocumentStorageAdapter,
        notificationServiceAdapter: mockNotificationServiceAdapter,
        paymentGatewayAdapter: mockPaymentGatewayAdapter,
      }
    );

    expect(reconciliationResult).toBeDefined();
    expect(reconciliationResult.dealId).toBe('DEAL-001');
    expect(reconciliationResult.invoiceId).toBe('INV-001');
    expect(reconciliationResult.matchStatus).toBe('MATCHED');
    expect(reconciliationResult.amountMatch).toBe(true);
    expect(reconciliationResult.reconciliationStatus).toBe('completed');

    expect(reconciliationResult.matchedAt).toEqual(
      expect.any(Date)
    );

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});