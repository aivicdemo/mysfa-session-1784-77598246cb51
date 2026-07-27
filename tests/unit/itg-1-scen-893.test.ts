import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-893: [error] 請求書承認検証機能 - 商談がまだ検討中ステータスなのに請求書が発行されているとき、ズレ検出が陽性を返す
  test('商談ステータスが検討中で請求書が発行済みのとき、ズレを検出してエラーを返す', () => {
    const dealId = 'deal_20240415_001';
    const invoiceId = 'inv_20240415_001';

    const dealRecord = {
      id: dealId,
      customerId: 'cust_001',
      status: '検討中',
      amount: 500000,
      createdAt: new Date('2024-04-10T09:00:00Z'),
    };

    const invoiceRecord = {
      id: invoiceId,
      dealId: dealId,
      customerId: 'cust_001',
      status: '発行済み',
      issuedDate: new Date('2024-04-15T14:30:00Z'),
      amount: 500000,
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ url: 'https://example.com/doc' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://share.example.com/doc' }),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ sent: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ sent: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ sent: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered' }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed' }),
    };

    expect(() =>
      validateInvoiceApproval(
        dealRecord,
        invoiceRecord,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      )
    ).toThrow(/検討中|請求書|商談ステータス|ズレ/);
  });
});