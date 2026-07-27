import { updateDealStatusToContracted } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  test('SCEN-212: 商談ステータス更新・請求データ紐付け機能 - 商談ステータスを成約に変更する際、必須項目チェックで金額が0の場合にステータス更新が拒否される', () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      currentStatus: '交渉中',
      amount: 0,
      details: [
        {
          detailId: 'DETAIL-001',
          productId: 'PROD-001',
          quantity: 1,
          unitPrice: 0,
        },
      ],
    };

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

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    expect(() =>
      updateDealStatusToContracted(
        dealRecord,
        '成約',
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      )
    ).toThrow(/金額/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});