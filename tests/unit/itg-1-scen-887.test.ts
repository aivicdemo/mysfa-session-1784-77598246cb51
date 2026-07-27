import { approveInvoiceWithCurrencyValidation } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-887
  test('請求書承認検証機能 - 請求書の通貨が指定されている場合、通貨コードが正確に反映される', async () => {
    // スタブ化したアダプタを定義
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-12345',
        fileUrl: 'https://example.com/invoices/doc-12345.pdf',
        metadata: {
          currency: 'USD',
          amount: 1000,
          customerName: 'テスト顧客A',
        },
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/abc123',
        expiresAt: new Date('2024-02-15T11:00:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ success: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ success: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-67890',
        sentAt: new Date('2024-01-15T11:00:00Z'),
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: new Date('2024-01-15T12:00:00Z'),
      }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'https://payment.example.com/pay/inv-12345',
        expiresAt: new Date('2024-02-15T11:00:00Z'),
        transactionId: 'txn-11111',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        paymentVerified: true,
        amount: 1000,
        currency: 'USD',
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'completed',
        amount: 1000,
        currency: 'USD',
      }),
    };

    // 入力データ
    const invoiceApprovalInput = {
      customerId: 'cust-001',
      customerName: 'テスト顧客A',
      invoiceAmount: 1000,
      currency: 'USD',
      invoiceDate: new Date('2024-01-15T11:00:00Z'),
      dueDate: new Date('2024-02-15T11:00:00Z'),
      lineItems: [
        {
          description: 'Product A',
          quantity: 1,
          unitPrice: 1000,
          amount: 1000,
        },
      ],
      customerEmail: 'customer@example.com',
    };

    // テスト対象関数を実行
    const result = await approveInvoiceWithCurrencyValidation(
      invoiceApprovalInput,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
    );

    // 期待結果の検証
    expect(result).toMatchObject({
      invoiceId: expect.any(String),
      status: 'approved',
      currency: 'USD',
      amount: 1000,
      formattedAmount: '1000 USD',
      customerName: 'テスト顧客A',
      documentMetadata: {
        currency: 'USD',
        amount: 1000,
        customerName: 'テスト顧客A',
      },
    });

    // 通貨フィールドが正確に『USD』として保存されていることを検証
    expect(result.currency).toBe('USD');

    // 金額が『1000 USD』という形式で表示可能な状態になっていることを検証
    expect(result.formattedAmount).toBe('1000 USD');

    // DocumentStorageAdapterの uploadDocument が呼ばれたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();

    // NotificationServiceAdapterの sendInvoiceNotification が呼ばれたことを確認
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();

    // PaymentGatewayAdapterの generatePaymentLink が呼ばれたことを確認
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();

    // アップロード後のメタデータに通貨コードが含まれていることを検証
    expect(result.documentMetadata.currency).toBe('USD');
  });
});