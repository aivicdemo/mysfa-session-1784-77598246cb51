import { generateInvoiceForDeal } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-616
  test('同一商談に対して請求書を2回実行した場合、1回目と2回目で同じ金額の請求書が生成される', () => {
    // Arrange: テストデータを準備する
    const dealRecord = {
      dealId: 'DEAL-001',
      customerName: 'テスト顧客A',
      totalAmount: 150000,
      lineItems: [
        { productName: '商品X', amount: 100000 },
        { productName: '商品Y', amount: 50000 },
      ],
    };

    // DocumentStorageAdapterをスタブ化する
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-12345',
        storageUrl: 'https://storage.example.com/invoices/INV-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/temp-link-001',
        expiresAt: '2024-12-31T23:59:59Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterをスタブ化する
    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-001',
        deliveryStatus: 'sent',
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({}),
    };

    // PaymentGatewayAdapterをスタブ化する
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'LINK-001',
        paymentUrl: 'https://payment.example.com/pay/LINK-001',
      }),
      verifyPayment: jest.fn().mockResolvedValue({}),
      getTransactionStatus: jest.fn().mockResolvedValue({}),
    };

    // Act & Assert: 1回目の請求書自動生成を実行する
    const firstInvoiceResult = generateInvoiceForDeal(
      dealRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // 1回目の請求書生成結果を確認する
    expect(firstInvoiceResult.invoiceId).toBe('INV-001');
    expect(firstInvoiceResult.totalAmount).toBe(150000);
    expect(firstInvoiceResult.lineItems).toEqual([
      { productName: '商品X', amount: 100000 },
      { productName: '商品Y', amount: 50000 },
    ]);
    expect(firstInvoiceResult.generatedAt).toBeDefined();

    // 1回目のDocumentStorageAdapter.uploadDocumentの呼び出し履歴を記録する
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    const firstUploadCall = mockDocumentStorageAdapter.uploadDocument.mock.calls[0][0];
    expect(firstUploadCall.totalAmount).toBe(150000);
    expect(firstUploadCall.lineItems).toEqual([
      { productName: '商品X', amount: 100000 },
      { productName: '商品Y', amount: 50000 },
    ]);

    // リセット: スタブをリセットして2回目の呼び出しを記録
    mockDocumentStorageAdapter.uploadDocument.mockClear();
    mockNotificationServiceAdapter.sendInvoiceNotification.mockClear();
    mockPaymentGatewayAdapter.generatePaymentLink.mockClear();

    // 商談 DEAL-001 に対して2回目の請求書自動生成を実行する
    const secondInvoiceResult = generateInvoiceForDeal(
      dealRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // 2回目の請求書生成結果を確認する
    expect(secondInvoiceResult.invoiceId).toBe('INV-002');
    expect(secondInvoiceResult.totalAmount).toBe(150000);
    expect(secondInvoiceResult.lineItems).toEqual([
      { productName: '商品X', amount: 100000 },
      { productName: '商品Y', amount: 50000 },
    ]);
    expect(secondInvoiceResult.generatedAt).toBeDefined();

    // 2回目のDocumentStorageAdapter.uploadDocumentの呼び出し履歴を記録する
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    const secondUploadCall = mockDocumentStorageAdapter.uploadDocument.mock.calls[0][0];
    expect(secondUploadCall.totalAmount).toBe(150000);
    expect(secondUploadCall.lineItems).toEqual([
      { productName: '商品X', amount: 100000 },
      { productName: '商品Y', amount: 50000 },
    ]);

    // 1回目と2回目で生成された請求書の合計金額を比較する
    expect(firstInvoiceResult.totalAmount).toBe(secondInvoiceResult.totalAmount);
    expect(firstInvoiceResult.totalAmount).toBe(150000);
    expect(secondInvoiceResult.totalAmount).toBe(150000);

    // 各請求書のDocumentStorageAdapter経由でアップロードされたPDF内の商品明細が同一であることを確認
    expect(firstUploadCall.lineItems).toEqual(secondUploadCall.lineItems);
  });
});