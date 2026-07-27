import { updateDealStatusAndLinkInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-221
  test('商談ステータスを成約に変更する際、請求データ紐付けで商談と請求書の関連付けが正常に実行される', () => {
    // テスト用の顧客データ
    const customer = {
      customer_id: 'CUST-001',
      customer_name: '山田商事',
      email: 'contact@yamada-shoji.jp',
    };

    // 商談データ
    const deal = {
      deal_id: 'DEAL-001',
      deal_name: '大型案件',
      customer_id: 'CUST-001',
      status: '提案中',
      amount: 500000,
      details: [
        {
          description: 'サービス提供',
          quantity: 1,
          unit_price: 500000,
        },
      ],
    };

    // DocumentStorageAdapterのスタブ
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC-001',
        storage_url: 'https://storage.example.com/invoices/DOC-001.pdf',
        upload_timestamp: '2024-01-15T11:00:00Z',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://share.example.com/DOC-001?token=abc123',
        expiry: '2024-02-15T11:00:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterのスタブ
    const mockNotificationService = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notification_id: 'NOTIF-001',
        status: 'sent',
        delivery_timestamp: '2024-01-15T11:05:00Z',
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notification_id: 'NOTIF-002',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        notification_id: 'NOTIF-003',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        notification_id: 'NOTIF-001',
        status: 'delivered',
        opened: true,
      }),
    };

    // PaymentGatewayAdapterのスタブ
    const mockPaymentGateway = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link_id: 'PAY-001',
        payment_link: 'https://payment.example.com/PAY-001',
        amount: 500000,
        currency: 'JPY',
        expiry: '2024-01-22T11:00:00Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transaction_id: 'TXN-001',
        status: 'completed',
        amount: 500000,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transaction_id: 'TXN-001',
        status: 'pending',
      }),
    };

    // 関数を実行
    const result = updateDealStatusAndLinkInvoice(
      deal,
      customer,
      {
        documentStorage: mockDocumentStorage,
        notificationService: mockNotificationService,
        paymentGateway: mockPaymentGateway,
      }
    );

    // 期待結果の検証
    expect(result.deal.status).toBe('成約');
    expect(result.deal.deal_id).toBe('DEAL-001');

    expect(result.invoice).toEqual(
      expect.objectContaining({
        deal_id: 'DEAL-001',
        customer_id: 'CUST-001',
        amount: 500000,
        status: '未送付',
      })
    );

    expect(result.invoice.payment_link_id).toBe('PAY-001');

    // DocumentStorageAdapterが呼び出されたことを確認
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        deal_id: 'DEAL-001',
        customer_id: 'CUST-001',
        amount: 500000,
      })
    );

    // NotificationServiceAdapterが呼び出されたことを確認
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'contact@yamada-shoji.jp',
        invoice_id: expect.any(String),
        amount: 500000,
      })
    );

    // PaymentGatewayAdapterが呼び出されたことを確認
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 500000,
        invoice_id: expect.any(String),
      })
    );

    // 完了フラグの確認
    expect(result.success).toBe(true);
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});