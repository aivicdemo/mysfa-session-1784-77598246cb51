import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { reconcileDealAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let documentStorageAdapterStub: any;
  let notificationServiceAdapterStub: any;
  let paymentGatewayAdapterStub: any;

  beforeEach(() => {
    documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-001',
        url: 'https://example.com/docs/DOC-001'
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/INV-001',
        expiresAt: '2024-12-31T23:59:59Z'
      }),
      deleteDocument: jest.fn().mockResolvedValue(true)
    };

    notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue(true),
      sendOrderNotification: jest.fn().mockResolvedValue(true),
      sendInvoiceNotification: jest.fn().mockResolvedValue(true),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: '2024-01-15T12:30:00Z'
      })
    };

    paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/pay/INV-001',
        expiresAt: '2024-12-31T23:59:59Z'
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: 'TXN-001',
        status: 'completed',
        paidAmount: 100000
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'completed',
        amount: 100000,
        timestamp: '2024-01-15T11:00:00Z'
      })
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-632
  test('対象商談が1件のとき、その1件の照合結果が返される', async () => {
    const targetDealIds = ['DEAL-001'];
    const reconciliationDate = new Date('2024-01-15T11:00:00Z');
    const reconciliationDateIso = reconciliationDate.toISOString();

    const dealData = {
      dealId: 'DEAL-001',
      customerId: 'CUST-A',
      status: '受注確定',
      amount: 100000,
      currency: 'JPY',
      createdAt: '2024-01-10T09:00:00Z'
    };

    const invoiceData = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      customerId: 'CUST-A',
      status: '発行済み',
      amount: 100000,
      currency: 'JPY',
      issuedAt: '2024-01-15T11:00:00Z',
      dueDate: '2024-02-15T23:59:59Z'
    };

    const reconciliationResult = await reconcileDealAndInvoice(
      targetDealIds,
      reconciliationDateIso,
      {
        deals: [dealData],
        invoices: [invoiceData]
      },
      documentStorageAdapterStub,
      notificationServiceAdapterStub,
      paymentGatewayAdapterStub
    );

    expect(reconciliationResult).toBeDefined();
    expect(Array.isArray(reconciliationResult)).toBe(true);
    expect(reconciliationResult).toHaveLength(1);

    const result = reconciliationResult[0];
    expect(result).toHaveProperty('reconciliationId');
    expect(result.dealId).toBe('DEAL-001');
    expect(result.invoiceId).toBe('INV-001');
    expect(result.dealStatus).toBe('受注確定');
    expect(result.invoiceStatus).toBe('発行済み');
    expect(result.dealAmount).toBe(100000);
    expect(result.invoiceAmount).toBe(100000);
    expect(result.amountMatch).toBe(true);
    expect(result.discrepancyType).toBe('なし');
    expect(result.reconciliationDatetime).toBe(reconciliationDateIso);
    expect(result.isValid).toBe(true);

    expect(documentStorageAdapterStub.generateShareLink).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: expect.stringContaining('INV-001')
      })
    );
    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalled();
    expect(paymentGatewayAdapterStub.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV-001',
        amount: 100000
      })
    );
  });
});