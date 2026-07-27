import {
  updateDealStatusAndLinkInvoice,
} from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  test('SCEN-219: 商談ステータスを成約に変更する際、請求データ紐付けで請求書が正常に生成される', async () => {
    // テスト用の商談データ準備
    const dealData = {
      deal_id: 'DEAL-001',
      customer_name: 'テスト顧客A',
      customer_email: 'customer@test.example.com',
      amount: 100000,
      current_status: '提案中',
      customer_id: 'CUST-001',
    };

    // DocumentStorageAdapter のモック
    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC-20240115-001',
        storage_url: 'https://drive.mock/files/DOC-20240115-001',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // NotificationServiceAdapter のモック
    const mockNotificationService = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notification_id: 'NOTIF-001',
        delivery_status: 'sent',
      }),
      getDeliveryStatus: jest.fn(),
    };

    // PaymentGatewayAdapter のモック
    const mockPaymentGateway = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link_id: 'PAYLINK-001',
        payment_url: 'https://payment.mock/pay/PAYLINK-001',
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    // 関数呼び出し：商談ステータスを「提案中」から「成約」に更新
    const result = await updateDealStatusAndLinkInvoice(
      dealData,
      'テスト顧客A',
      100000,
      {
        documentStorageAdapter: mockDocumentStorage,
        notificationServiceAdapter: mockNotificationService,
        paymentGatewayAdapter: mockPaymentGateway,
      }
    );

    // 商談ステータスが成約に更新されたか検証
    expect(result.deal_status).toBe('成約');

    // DocumentStorageAdapter.uploadDocument が呼び出されたか検証
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalled();
    const uploadCallArgs = mockDocumentStorage.uploadDocument.mock.calls[0][0];
    expect(uploadCallArgs.deal_id).toBe('DEAL-001');
    expect(uploadCallArgs.customer_id).toBe('CUST-001');
    expect(uploadCallArgs.amount).toBe(100000);

    // 返却されたドキュメントID が正しいか検証
    expect(result.document_id).toBe('DOC-20240115-001');
    expect(result.storage_url).toBe('https://drive.mock/files/DOC-20240115-001');

    // NotificationServiceAdapter.sendInvoiceNotification が呼び出されたか検証
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalled();
    const notificationCallArgs = mockNotificationService.sendInvoiceNotification.mock.calls[0][0];
    expect(notificationCallArgs.customer_email).toBe('customer@test.example.com');
    expect(notificationCallArgs.deal_id).toBe('DEAL-001');
    expect(notificationCallArgs.document_id).toBe('DOC-20240115-001');

    // 返却された通知ID が正しいか検証
    expect(result.notification_id).toBe('NOTIF-001');
    expect(result.delivery_status).toBe('sent');

    // PaymentGatewayAdapter.generatePaymentLink が呼び出されたか検証
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalled();
    const paymentCallArgs = mockPaymentGateway.generatePaymentLink.mock.calls[0][0];
    expect(paymentCallArgs.deal_id).toBe('DEAL-001');
    expect(paymentCallArgs.amount).toBe(100000);
    expect(paymentCallArgs.customer_id).toBe('CUST-001');

    // 返却された支払いリンクID が正しいか検証
    expect(result.payment_link_id).toBe('PAYLINK-001');
    expect(result.payment_url).toBe('https://payment.mock/pay/PAYLINK-001');

    // DB に作成された請求書レコードが正しいか検証
    expect(result.invoice_record).toBeDefined();
    expect(result.invoice_record.status).toBe('未払い');
    expect(result.invoice_record.amount).toBe(100000);
    expect(result.invoice_record.deal_id).toBe('DEAL-001');
    expect(result.invoice_record.customer_id).toBe('CUST-001');
    expect(result.invoice_record.document_id).toBe('DOC-20240115-001');
    expect(result.invoice_record.payment_link_id).toBe('PAYLINK-001');

    // 請求書レコードの生成日時がおおむね現在時刻に近いか検証
    const invoiceCreatedAt = new Date(result.invoice_record.created_at);
    const now = new Date();
    const timeDiffMs = now.getTime() - invoiceCreatedAt.getTime();
    expect(timeDiffMs).toBeLessThan(5000); // 5秒以内

    // ユーザーが商談詳細画面で確認できる情報が正しいか検証
    expect(result.invoice_display_info).toBeDefined();
    expect(result.invoice_display_info.invoice_id).toBeDefined();
    expect(result.invoice_display_info.status).toBe('未払い');
    expect(result.invoice_display_info.amount).toBe(100000);
    expect(result.invoice_display_info.download_link).toBe(
      'https://drive.mock/files/DOC-20240115-001'
    );
    expect(result.invoice_display_info.payment_link).toBe(
      'https://payment.mock/pay/PAYLINK-001'
    );
  });
});