import { generateInvoiceFromQuote } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-590
  test('見積明細の単価が0円の場合、請求金額も0円で計算される', () => {
    // モック化されたアダプタを初期化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ documentId: 'doc-001', fileUrl: 'https://example.com/doc-001.pdf' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://drive.google.com/share/001' }),
      deleteDocument: jest.fn().mockResolvedValue({}),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ status: 'sent', messageId: 'msg-001' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ status: 'sent', messageId: 'msg-002' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ status: 'sent', messageId: 'msg-003' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true, openedAt: '2024-01-15T12:30:00Z' }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/pay-001', expiresAt: '2024-02-15T00:00:00Z' }),
      verifyPayment: jest.fn().mockResolvedValue({ status: 'verified', transactionId: 'txn-001' }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed', amount: 0 }),
    };

    // 見積明細行を作成（単価0円）
    const quoteDetailLine = {
      detailLineId: 'qd-001',
      productName: 'テスト商品',
      quantity: 5,
      unitPrice: 0,
      lineTotal: 0,
    };

    // 見積書レコードを作成
    const quoteRecord = {
      quoteId: 'q-001',
      customerId: 'c-001',
      customerName: '顧客A',
      customerEmail: 'customer-a@example.com',
      detailLines: [quoteDetailLine],
      totalAmount: 0,
      createdAt: '2024-01-10T09:00:00Z',
    };

    // 請求書自動生成処理を実行
    const generatedInvoice = generateInvoiceFromQuote(
      quoteRecord,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // 請求書の『請求金額』が0円であることを確認
    expect(generatedInvoice.invoiceAmount).toBe(0);

    // 請求明細行の単価と金額を確認
    expect(generatedInvoice.invoiceDetailLines).toHaveLength(1);
    expect(generatedInvoice.invoiceDetailLines[0].unitPrice).toBe(0);
    expect(generatedInvoice.invoiceDetailLines[0].lineTotal).toBe(0);

    // 数量は『5』のまま保持されていることを確認
    expect(generatedInvoice.invoiceDetailLines[0].quantity).toBe(5);

    // 商品名が保持されていることを確認
    expect(generatedInvoice.invoiceDetailLines[0].productName).toBe('テスト商品');

    // DocumentStorageAdapterのuploadDocumentメソッドがコール可能な状態であることを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toBeDefined();
  });
});