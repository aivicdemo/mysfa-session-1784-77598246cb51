import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  reconcileSalesVsInvoices,
  type SalesRevenueRecord,
  type InvoiceRecord,
  type ReconciliationResult,
} from '../../src/logic/it-1784969823049-1-1-1';

interface DocumentStorageAdapter {
  uploadDocument(pdf: Buffer, filename: string): Promise<{ documentId: string; url: string }>;
  generateShareLink(documentId: string): Promise<{ shareLink: string; expiresAt: string }>;
  deleteDocument(documentId: string): Promise<void>;
}

interface NotificationServiceAdapter {
  sendQuoteNotification(recipientEmail: string, quoteId: string): Promise<{ messageId: string }>;
  sendOrderNotification(recipientEmail: string, orderId: string): Promise<{ messageId: string }>;
  sendInvoiceNotification(recipientEmail: string, invoiceId: string): Promise<{ messageId: string }>;
  getDeliveryStatus(messageId: string): Promise<{ status: string; openedAt?: string }>;
}

interface PaymentGatewayAdapter {
  generatePaymentLink(invoiceId: string, amount: number): Promise<{ paymentLink: string; expiresAt: string }>;
  verifyPayment(invoiceId: string): Promise<{ paid: boolean; paidAt?: string }>;
  getTransactionStatus(transactionId: string): Promise<{ status: string; amount: number }>;
}

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-952
  test('売上実績・請求状況照合機能 - 移行前後で売上実績に対応する請求書が1件の場合、照合対象が正しく特定される', async () => {
    // Arrange: テスト対象システムを初期化し、外部サービスアダプタをスタブ化
    const mockDocumentStorageAdapter: DocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-001',
        url: 'https://example.com/documents/doc-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/doc-001?token=abc123',
        expiresAt: '2024-02-15T11:00:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue(undefined),
    };

    const mockNotificationServiceAdapter: NotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-quote-001',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-order-001',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-invoice-001',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
      }),
    };

    const mockPaymentGatewayAdapter: PaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/link/inv-001?token=xyz789',
        expiresAt: '2024-02-15T11:00:00Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        paid: false,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'pending',
        amount: 100000,
      }),
    };

    // 売上実績データセット: 顧客A、金額100,000円、売上日2024年1月15日の1件
    const salesRevenueRecords: SalesRevenueRecord[] = [
      {
        recordId: 'sales-001',
        customerId: 'cust-a',
        customerName: 'Customer A',
        amount: 100000,
        salesDate: new Date('2024-01-15T00:00:00Z'),
        dealStatusAtSalesDate: 'received',
      },
    ];

    // 請求書データセット: 顧客A、金額100,000円、請求日2024年1月20日の1件
    const invoiceRecords: InvoiceRecord[] = [
      {
        invoiceId: 'inv-001',
        customerId: 'cust-a',
        customerName: 'Customer A',
        amount: 100000,
        invoiceIssuedDate: new Date('2024-01-20T00:00:00Z'),
        invoiceStatus: 'issued',
        documentStorageId: 'doc-001',
      },
    ];

    // Act: 売上実績・請求状況照合機能を実行
    const reconciliationResult: ReconciliationResult = await reconcileSalesVsInvoices(
      salesRevenueRecords,
      invoiceRecords,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert: 照合結果から特定された請求書を検証
    expect(reconciliationResult.matchedInvoices).toHaveLength(1);
    expect(reconciliationResult.matchedInvoices[0]).toEqual({
      invoiceId: 'inv-001',
      customerId: 'cust-a',
      customerName: 'Customer A',
      amount: 100000,
      invoiceIssuedDate: new Date('2024-01-20T00:00:00Z'),
      invoiceStatus: 'issued',
      documentStorageId: 'doc-001',
    });

    // 確認: 照合されたデータが売上実績と一致
    expect(reconciliationResult.matchedInvoices[0].customerId).toBe('cust-a');
    expect(reconciliationResult.matchedInvoices[0].amount).toBe(100000);
    expect(reconciliationResult.matchedInvoices[0].invoiceIssuedDate).toEqual(
      new Date('2024-01-20T00:00:00Z')
    );

    // 確認: 未照合案件が存在しないこと
    expect(reconciliationResult.unmatchedSalesRecords).toHaveLength(0);
    expect(reconciliationResult.unmatchedInvoices).toHaveLength(0);

    // 確認: 外部アダプタが期待通りに呼び出されたこと
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();
  });
});