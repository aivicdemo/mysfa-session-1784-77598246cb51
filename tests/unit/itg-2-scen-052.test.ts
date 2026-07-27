import { issueOrder } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-052
  test('帳票発行時の発行日時自動付与と発行履歴記録 - 帳票IDが欠けている入力で注文書を発行しようとしたときは例外が発生する', () => {
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

    const orderInput = {
      documentId: '',
      customerId: 'CUST-001',
      customerName: '株式会社サンプル',
      items: [
        {
          productId: 'PROD-001',
          productName: 'サンプル商品A',
          quantity: 5,
          unitPrice: 10000,
        },
      ],
      totalAmount: 50000,
      orderDate: '2024-01-15T11:00:00Z',
    };

    expect(() =>
      issueOrder(orderInput, mockDocumentStorageAdapter, mockNotificationServiceAdapter)
    ).toThrow(/帳票ID/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendOrderNotification).not.toHaveBeenCalled();
  });
});