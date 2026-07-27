import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let originalNow: typeof Date.now;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    Date.now = originalNow;
  });

  // SCEN-584
  test('年度をまたいだ請求予定日を持つ案件が遅延となった場合、遅延案件として正しく判定される', () => {
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'link_001',
        url: 'https://payment.example.com/pay/link_001',
        expiryDate: '2025-02-28T23:59:59Z'
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn()
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg_001',
        recipientEmail: 'customer@example.com',
        sentAt: '2024-12-15T10:00:00Z',
        status: 'delivered'
      }),
      getDeliveryStatus: jest.fn()
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc_001',
        storagePath: 'gs://bucket/invoices/doc_001.pdf',
        uploadedAt: '2024-12-15T10:00:00Z'
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn()
    };

    const dealData = {
      dealId: 'DEAL-2024-001',
      customerName: 'テスト顧客A',
      dealStatus: '受注',
      billScheduledDate: new Date('2025-01-20T00:00:00Z'),
      billAmount: 500000,
      invoiceIssuedDate: new Date('2024-12-15T10:00:00Z'),
      invoiceId: 'INV-2024-001',
      isInvoiced: true
    };

    const currentSystemTime = new Date('2025-02-01T10:00:00Z');

    const result = detectDelayedDeals(
      [dealData],
      currentSystemTime,
      mockPaymentGatewayAdapter,
      mockNotificationServiceAdapter,
      mockDocumentStorageAdapter
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      dealId: 'DEAL-2024-001',
      customerName: 'テスト顧客A',
      dealStatus: '受注',
      billScheduledDate: new Date('2025-01-20T00:00:00Z'),
      billAmount: 500000,
      invoiceIssuedDate: new Date('2024-12-15T10:00:00Z'),
      invoiceId: 'INV-2024-001',
      isDelayed: true,
      delayDetectionDateTime: new Date('2025-02-01T10:00:00Z'),
      delayStatus: '要注意',
      delayDays: 12
    });
  });
});