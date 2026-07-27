import { issueQuote } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル商談情報参照機能 - 帳票発行', () => {
  // SCEN-048
  test('発行日時が欠けている入力で見積書を発行しようとしたときは例外が発生する', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const quoteInput = {
      customerId: 'CUST-001',
      customerName: 'テスト顧客株式会社',
      customerEmail: 'test@example.com',
      productName: '営業管理システムライセンス',
      quantity: 5,
      unitPrice: 100000,
      issuedAt: undefined,
    };

    expect(() =>
      issueQuote(
        quoteInput,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter
      )
    ).toThrow(/発行日時/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendQuoteNotification
    ).not.toHaveBeenCalled();
  });
});