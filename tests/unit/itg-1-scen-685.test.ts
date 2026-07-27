import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import type { Deal, Invoice, DiscrepancyResult } from '../../src/logic/it-1784969823049-1-1-1';
import { detectDealInvoiceDiscrepancies } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-685: 月次決算期限3営業日前に照合開始時、遅延案件が0件の場合、検出結果は空配列を返す
  test('should return empty array when no discrepancies exist at 3 business days before monthly cutoff', () => {
    const cutoffDate = new Date('2024-05-31T23:59:59Z');
    const threeBusinessDaysBefore = new Date('2024-05-27T09:00:00Z');
    const currentDate = threeBusinessDaysBefore;

    const deals: Deal[] = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-A',
        status: 'closed_won',
        amount: 100000,
        createdDate: new Date('2024-05-10T10:00:00Z'),
        targetInvoiceDate: new Date('2024-05-20T00:00:00Z'),
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-B',
        status: 'closed_won',
        amount: 250000,
        createdDate: new Date('2024-05-12T14:30:00Z'),
        targetInvoiceDate: new Date('2024-05-22T00:00:00Z'),
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-C',
        status: 'closed_won',
        amount: 75000,
        createdDate: new Date('2024-05-15T09:15:00Z'),
        targetInvoiceDate: new Date('2024-05-25T00:00:00Z'),
      },
    ];

    const invoices: Invoice[] = [
      {
        invoiceId: 'INV-001',
        dealId: 'DEAL-001',
        customerId: 'CUST-A',
        amount: 100000,
        status: 'issued',
        issuedDate: new Date('2024-05-20T11:00:00Z'),
      },
      {
        invoiceId: 'INV-002',
        dealId: 'DEAL-002',
        customerId: 'CUST-B',
        amount: 250000,
        status: 'issued',
        issuedDate: new Date('2024-05-22T13:45:00Z'),
      },
      {
        invoiceId: 'INV-003',
        dealId: 'DEAL-003',
        customerId: 'CUST-C',
        amount: 75000,
        status: 'issued',
        issuedDate: new Date('2024-05-25T10:30:00Z'),
      },
    ];

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ documentUrl: 'https://storage.example.com/doc-001' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://share.example.com/token-001' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg-quote-001' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg-order-001' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg-invoice-001' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered', openedAt: new Date('2024-05-26T08:00:00Z') }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/link-001' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true, transactionId: 'txn-001' }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed', paidAmount: 100000 }),
    };

    const result: DiscrepancyResult[] = detectDealInvoiceDiscrepancies(
      deals,
      invoices,
      currentDate,
      cutoffDate,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });
});