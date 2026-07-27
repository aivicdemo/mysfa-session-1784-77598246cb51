import { validateBillingData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-805
  test('請求対象データ妥当性検証機能 - 請求金額が0円のとき、該当データを不承認と判定する', () => {
    // 準備: テスト用の請求対象データ
    const testBillingData = {
      customerId: 'CUST-001',
      billingAmount: 0,
      billingDate: '2024-04-15',
      billingPeriodStart: '2024-04-01',
      billingPeriodEnd: '2024-04-30',
      invoiceNumber: 'INV-2024-0001',
      items: [
        {
          itemId: 'ITEM-001',
          description: 'Service A',
          quantity: 1,
          unitPrice: 0,
        },
      ],
    };

    // スタブ化: 外部サービスとの通信を遮断
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

    // 実行: 請求対象データ妥当性検証機能を呼び出し
    const validationResult = validateBillingData(
      testBillingData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // 検証: 検証結果を確認
    expect(validationResult.status).toBe('REJECTED');
    expect(validationResult.reason).toContain('請求金額が0円のため処理対象外');
    expect(validationResult.errorCode).toBe('BILLING_AMOUNT_ZERO');

    // 検証: 外部サービス呼び出しが実行されていないことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});