import { reconcileDealsAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-682
  test('[edge] 月次決算期限3営業日前に照合開始時、未請求案件が0件の場合、検出結果は空配列を返す', () => {
    const now = new Date('2024-04-17T09:00:00Z');
    const monthlyDeadline = new Date('2024-04-30T18:00:00Z');

    const mockDeals = [
      {
        dealId: 'DEAL001',
        customerId: 'CUST001',
        customerName: 'Customer A Inc.',
        status: '成約',
        amount: 1000000,
        dealDate: new Date('2024-04-10T10:00:00Z'),
        expectedBillingDate: new Date('2024-04-15T00:00:00Z'),
      },
      {
        dealId: 'DEAL002',
        customerId: 'CUST002',
        customerName: 'Customer B Ltd.',
        status: '成約',
        amount: 500000,
        dealDate: new Date('2024-04-12T14:30:00Z'),
        expectedBillingDate: new Date('2024-04-17T00:00:00Z'),
      },
      {
        dealId: 'DEAL003',
        customerId: 'CUST003',
        customerName: 'Customer C Corp.',
        status: '成約',
        amount: 750000,
        dealDate: new Date('2024-04-08T11:15:00Z'),
        expectedBillingDate: new Date('2024-04-14T00:00:00Z'),
      },
    ];

    const mockInvoices = [
      {
        invoiceId: 'INV001',
        dealId: 'DEAL001',
        status: '発行済み',
        billingDate: new Date('2024-04-15T09:00:00Z'),
        amount: 1000000,
      },
      {
        invoiceId: 'INV002',
        dealId: 'DEAL002',
        status: '発行済み',
        billingDate: new Date('2024-04-17T10:00:00Z'),
        amount: 500000,
      },
      {
        invoiceId: 'INV003',
        dealId: 'DEAL003',
        status: '発行済み',
        billingDate: new Date('2024-04-14T08:30:00Z'),
        amount: 750000,
      },
    ];

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ success: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ success: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ success: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true }),
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ fileId: 'FILE001', url: 'https://storage.example.com/FILE001' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://share.example.com/share001' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/link001' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true, status: 'completed' }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed', amount: 1000000 }),
    };

    const result = reconcileDealsAndInvoices({
      currentDateTime: now,
      monthlyDeadline: monthlyDeadline,
      deals: mockDeals,
      invoices: mockInvoices,
      notificationServiceAdapter: mockNotificationServiceAdapter,
      documentStorageAdapter: mockDocumentStorageAdapter,
      paymentGatewayAdapter: mockPaymentGatewayAdapter,
    });

    expect(Array.isArray(result.unreconciledItems)).toBe(true);
    expect(result.unreconciledItems).toEqual([]);
    expect(result.unreconciledCount).toBe(0);
    expect(result.unissuedCount).toBe(0);
    expect(result.statusMismatchCount).toBe(0);
    expect(result.reconciliationLog).toMatch(/照合完了/);
    expect(result.reconciliationLog).toMatch(/未請求案件0件/);
    expect(result.reconciliationLog).toMatch(/ステータス不一致0件/);
  });
});