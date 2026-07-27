import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { detectDelayedInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-583: [edge] 商談ステータスと請求書の自動照合・遅延案件検出 - 月初日が請求予定日である案件が遅延となった場合、遅延案件として正しく判定される
  test('月初日が請求予定日の案件が遅延日数9日で正しく検出される', () => {
    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({ success: true }),
      getDeliveryStatus: jest.fn(),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc_12345',
        url: 'https://storage.example.com/doc_12345.pdf',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'link_67890',
        paymentUrl: 'https://payment.example.com/link_67890',
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const dealRecord = {
      dealId: 'deal_001',
      customerId: 'cust_001',
      dealStatus: 'invoice_issued_delayed',
      invoiceAmount: 100000,
      invoiceIssuedDate: new Date('2024-01-01T00:00:00Z'),
      invoiceDueDate: new Date('2024-01-01T00:00:00Z'),
      delayedFlag: true,
      delayedDays: 9,
    };

    const systemCurrentDate = new Date('2024-01-10T00:00:00Z');
    const invoicePredictedDate = new Date('2024-01-01T00:00:00Z');

    const result = detectDelayedInvoices(
      [dealRecord],
      systemCurrentDate,
      invoicePredictedDate,
      mockNotificationServiceAdapter,
      mockDocumentStorageAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.delayedInvoices).toHaveLength(1);
    expect(result.delayedInvoices[0].dealId).toBe('deal_001');
    expect(result.delayedInvoices[0].dealStatus).toBe('invoice_issued_delayed');
    expect(result.delayedInvoices[0].delayedFlag).toBe(true);
    expect(result.delayedInvoices[0].delayedDays).toBe(9);
    expect(result.delayedInvoices[0].invoiceAmount).toBe(100000);
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();
  });
});