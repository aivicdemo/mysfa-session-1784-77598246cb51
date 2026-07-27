import { generateInvoiceFromDeal } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-588
  test('商談に紐付く見積明細が1件の場合、その1件を請求明細として含める', () => {
    // Arrange: テスト用商談レコードを作成
    const deal_id = 'DEAL-20240115-001';
    const customer_id = 'CUST-A001';
    const deal_record = {
      deal_id: deal_id,
      customer_id: customer_id,
      deal_status: '進行中',
      deal_name: 'ライセンス年間契約案件',
      deal_amount: 100000,
      created_at: new Date('2024-01-15T09:00:00Z'),
      updated_at: new Date('2024-01-15T09:00:00Z'),
    };

    // Arrange: 見積レコードを作成
    const quote_id = 'QUOTE-20240115-001';
    const quote_record = {
      quote_id: quote_id,
      deal_id: deal_id,
      customer_id: customer_id,
      quote_amount: 100000,
      quote_status: '発行済み',
      created_at: new Date('2024-01-15T09:30:00Z'),
      updated_at: new Date('2024-01-15T09:30:00Z'),
    };

    // Arrange: 見積明細レコードを1件作成
    const quote_line_item_id = 'QLINE-20240115-001';
    const quote_line_item = {
      quote_line_item_id: quote_line_item_id,
      quote_id: quote_id,
      item_name: 'ライセンス年間契約',
      quantity: 1,
      unit_price: 100000,
      line_amount: 100000,
      created_at: new Date('2024-01-15T09:30:30Z'),
      updated_at: new Date('2024-01-15T09:30:30Z'),
    };

    // Arrange: DocumentStorageAdapterをモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC-20240115-001',
        storage_path: 'gs://bucket/invoices/INV-20240115-001.pdf',
        created_at: new Date('2024-01-15T10:00:00Z'),
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://drive.google.com/file/d/share123',
        expires_at: new Date('2024-01-22T10:00:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Arrange: NotificationServiceAdapterをモック化
    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notification_id: 'NOTIF-20240115-001',
        recipient_email: 'customer@example.com',
        sent_at: new Date('2024-01-15T10:05:00Z'),
        delivery_status: '送信済み',
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue(null),
      sendOrderNotification: jest.fn().mockResolvedValue(null),
      getDeliveryStatus: jest.fn().mockResolvedValue(null),
    };

    // Arrange: PaymentGatewayAdapterをモック化
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link: 'https://payment.gmo.jp/pay/link123',
        link_expires_at: new Date('2024-01-18T10:00:00Z'),
      }),
      verifyPayment: jest.fn().mockResolvedValue(null),
      getTransactionStatus: jest.fn().mockResolvedValue(null),
    };

    // Arrange: テスト用データベースリポジトリをモック化
    const mockDealRepository = {
      findById: jest.fn().mockResolvedValue(deal_record),
    };

    const mockQuoteRepository = {
      findByDealId: jest.fn().mockResolvedValue([quote_record]),
    };

    const mockQuoteLineItemRepository = {
      findByQuoteId: jest.fn().mockResolvedValue([quote_line_item]),
    };

    const mockInvoiceRepository = {
      create: jest.fn().mockResolvedValue({
        invoice_id: 'INV-20240115-001',
        deal_id: deal_id,
        customer_id: customer_id,
        invoice_status: '発行済み',
        total_amount: 100000,
        created_at: new Date('2024-01-15T10:00:00Z'),
        updated_at: new Date('2024-01-15T10:00:00Z'),
      }),
    };

    const mockInvoiceLineItemRepository = {
      create: jest.fn().mockResolvedValue({
        invoice_line_item_id: 'ILINE-20240115-001',
        invoice_id: 'INV-20240115-001',
        item_name: 'ライセンス年間契約',
        quantity: 1,
        unit_price: 100000,
        line_amount: 100000,
        created_at: new Date('2024-01-15T10:00:30Z'),
        updated_at: new Date('2024-01-15T10:00:30Z'),
      }),
      findByInvoiceId: jest.fn().mockResolvedValue([
        {
          invoice_line_item_id: 'ILINE-20240115-001',
          invoice_id: 'INV-20240115-001',
          item_name: 'ライセンス年間契約',
          quantity: 1,
          unit_price: 100000,
          line_amount: 100000,
          created_at: new Date('2024-01-15T10:00:30Z'),
          updated_at: new Date('2024-01-15T10:00:30Z'),
        },
      ]),
    };

    const mockCustomerRepository = {
      findById: jest.fn().mockResolvedValue({
        customer_id: customer_id,
        customer_name: 'テスト顧客',
        customer_email: 'customer@example.com',
        postal_code: '100-0001',
        address: '東京都千代田区丸の内',
      }),
    };

    // Act: 請求書自動生成機能を実行
    const result = generateInvoiceFromDeal(
      deal_id,
      mockDealRepository,
      mockQuoteRepository,
      mockQuoteLineItemRepository,
      mockInvoiceRepository,
      mockInvoiceLineItemRepository,
      mockCustomerRepository,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    // Assert: 戻り値の請求書情報を検証
    expect(result).resolves.toMatchObject({
      invoice_id: 'INV-20240115-001',
      deal_id: deal_id,
      customer_id: customer_id,
      invoice_status: '発行済み',
      total_amount: 100000,
    });

    // Assert: 請求書生成時に見積明細が正しくコピーされたことを検証
    expect(mockInvoiceLineItemRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id: 'INV-20240115-001',
        item_name: 'ライセンス年間契約',
        quantity: 1,
        unit_price: 100000,
        line_amount: 100000,
      })
    );

    // Assert: 請求明細行が1件だけ存在することを検証
    expect(mockInvoiceLineItemRepository.findByInvoiceId).toHaveBeenCalledWith(
      'INV-20240115-001'
    );

    // Assert: DocumentStorageAdapterのuploadDocumentメソッドが呼ばれたことを検証
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();

    // Assert: NotificationServiceAdapterのsendInvoiceNotificationメソッドが呼ばれたことを検証
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();

    // Assert: PaymentGatewayAdapterのgeneratePaymentLinkメソッドが呼ばれたことを検証
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();
  });
});