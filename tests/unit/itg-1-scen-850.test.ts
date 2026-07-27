import { describe, test, expect, beforeEach } from '@jest/globals';
import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  let documentStorageAdapterStub: any;
  let notificationServiceAdapterStub: any;
  let paymentGatewayAdapterStub: any;

  beforeEach(() => {
    documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({ fileId: 'doc-12345' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/share/doc-12345' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg-001' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg-002' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg-003' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true, openedAt: '2024-01-15T12:30:00Z' }),
    };

    paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/link-abc123' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true, transactionId: 'txn-456' }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed', amount: 4500 }),
    };
  });

  // SCEN-850
  test('請求書承認検証機能 - 請求明細が複数件のとき検証が合格する', async () => {
    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-100',
      customerName: '株式会社テスト',
      customerEmail: 'contact@test-company.com',
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      invoiceDetails: [
        {
          detailId: 'detail-001',
          productName: '商品A',
          quantity: 1,
          unitPrice: 1000,
          lineTotal: 1000,
        },
        {
          detailId: 'detail-002',
          productName: '商品B',
          quantity: 2,
          unitPrice: 1000,
          lineTotal: 2000,
        },
        {
          detailId: 'detail-003',
          productName: '商品C',
          quantity: 1,
          unitPrice: 1500,
          lineTotal: 1500,
        },
      ],
      totalAmount: 4500,
      taxRate: 0,
      taxAmount: 0,
      amountDue: 4500,
    };

    const result = await validateInvoiceApproval(
      invoiceData,
      documentStorageAdapterStub,
      notificationServiceAdapterStub,
      paymentGatewayAdapterStub
    );

    expect(result.validationStatus).toBe('合格');
    expect(result.detailsValidated).toBe(3);
    expect(result.allDetailsPass).toBe(true);
    expect(result.calculatedTotalAmount).toBe(4500);
    expect(result.totalAmountMatchesDetails).toBe(true);
    expect(result.validationLog).toContain('複数明細検証完了');
    expect(result.validationLog).toContain('detail-001');
    expect(result.validationLog).toContain('detail-002');
    expect(result.validationLog).toContain('detail-003');
    expect(result.errors).toEqual([]);
  });
});