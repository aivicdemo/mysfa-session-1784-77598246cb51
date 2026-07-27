import { detectInvoiceDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-892
  test('商談が受注ステータスだが請求書が未発行のとき、ズレ検出が陽性を返す', () => {
    const mockDocumentStorage = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationService = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGateway = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const dealRecord = {
      dealId: 'DEAL-20240415-001',
      status: '受注',
      customerName: 'テスト顧客A',
      customerId: 'CUST-20240415-A001',
      amount: 100000,
      invoiceIssuedDate: null,
    };

    const result = detectInvoiceDiscrepancy(
      dealRecord,
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway
    );

    expect(result).toEqual({
      isDiscrepancyDetected: true,
      errorMessage: '商談『テスト顧客A』（ID: CUST-20240415-A001）は受注ステータスですが、対応する請求書がまだ発行されていません',
    });

    expect(mockDocumentStorage.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationService.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGateway.generatePaymentLink).not.toHaveBeenCalled();
  });
});