import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { generateInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  let documentStorageAdapterMock: any;
  let notificationServiceAdapterMock: any;
  let paymentGatewayAdapterMock: any;

  beforeEach(() => {
    documentStorageAdapterMock = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc_invoice_001',
        url: 'https://storage.example.com/invoices/doc_invoice_001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://storage.example.com/share/token_abc123',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    notificationServiceAdapterMock = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ success: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ success: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ success: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true }),
    };

    paymentGatewayAdapterMock = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'pay_link_001',
        paymentUrl: 'https://payment.example.com/pay/pay_link_001',
      }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed' }),
    };
  });

  // SCEN-618
  test('請求書発行日が月初の場合、請求書に正しい月初日付が記録される', async () => {
    const invoiceRequestData = {
      customerId: 'cust_20240401_001',
      customerName: '株式会社テスト',
      customerEmail: 'contact@test-company.jp',
      dealId: 'deal_20240401_001',
      dealAmount: 500000,
      dealCurrency: 'JPY',
      issueDate: '2024-04-01',
      dueDate: '2024-05-01',
      lineItems: [
        {
          itemId: 'item_001',
          description: 'コンサルティングサービス',
          quantity: 1,
          unitPrice: 500000,
          subtotal: 500000,
        },
      ],
      companyBankAccount: {
        bankName: '○○銀行',
        branchName: '○○支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountHolderName: '株式会社テスト',
      },
    };

    const generatedInvoice = await generateInvoice(
      invoiceRequestData,
      documentStorageAdapterMock,
      notificationServiceAdapterMock,
      paymentGatewayAdapterMock,
    );

    expect(generatedInvoice.issueDate).toBe('2024-04-01');

    expect(documentStorageAdapterMock.uploadDocument).toHaveBeenCalledTimes(1);
    const uploadCall = documentStorageAdapterMock.uploadDocument.mock.calls[0];
    const uploadedDocumentContent = uploadCall[0];

    expect(uploadedDocumentContent).toContain('2024年4月1日');

    expect(notificationServiceAdapterMock.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    const notificationCall = notificationServiceAdapterMock.sendInvoiceNotification.mock.calls[0];
    expect(notificationCall[0]).toMatchObject({
      customerId: 'cust_20240401_001',
      customerEmail: 'contact@test-company.jp',
    });

    expect(paymentGatewayAdapterMock.generatePaymentLink).toHaveBeenCalledTimes(1);
    const paymentLinkCall = paymentGatewayAdapterMock.generatePaymentLink.mock.calls[0];
    expect(paymentLinkCall[0]).toMatchObject({
      invoiceAmount: 500000,
      invoiceCurrency: 'JPY',
    });

    expect(generatedInvoice.documentId).toBe('doc_invoice_001');
    expect(generatedInvoice.paymentLinkId).toBe('pay_link_001');
  });
});