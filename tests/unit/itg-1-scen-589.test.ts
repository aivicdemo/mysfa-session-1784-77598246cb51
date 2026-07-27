import { generateInvoiceFromDeal } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-589
  test('請求書自動生成機能 - 商談に紐付く見積明細が複数件の場合、全件を請求明細として含める', async () => {
    const deal_id = 'deal-001';
    const customer_name = 'テスト顧客A';
    const deal_amount = 300000;

    const quote_details = [
      {
        detail_id: 'detail-001',
        product_name: '商品X',
        quantity: 2,
        unit_price: 50000,
        subtotal: 100000,
      },
      {
        detail_id: 'detail-002',
        product_name: '商品Y',
        quantity: 1,
        unit_price: 100000,
        subtotal: 100000,
      },
      {
        detail_id: 'detail-003',
        product_name: 'サービスZ',
        quantity: 1,
        unit_price: 100000,
        subtotal: 100000,
      },
    ];

    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        file_id: 'file-12345',
        url: 'https://storage.example.com/invoice-001.pdf',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationService = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notification_id: 'notif-001',
        status: 'sent',
      }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGateway = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link: 'https://payment.example.com/invoice-001',
        expires_at: '2024-02-15T23:59:59Z',
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const result = await generateInvoiceFromDeal(
      {
        deal_id,
        customer_name,
        deal_amount,
        quote_details,
      },
      mockDocumentStorage,
      mockNotificationService,
      mockPaymentGateway
    );

    expect(result.invoice_id).toBeDefined();
    expect(result.customer_name).toBe('テスト顧客A');
    expect(result.invoice_amount).toBe(300000);
    expect(result.invoice_details).toHaveLength(3);

    expect(result.invoice_details[0]).toEqual({
      detail_id: 'detail-001',
      product_name: '商品X',
      quantity: 2,
      unit_price: 50000,
      subtotal: 100000,
    });

    expect(result.invoice_details[1]).toEqual({
      detail_id: 'detail-002',
      product_name: '商品Y',
      quantity: 1,
      unit_price: 100000,
      subtotal: 100000,
    });

    expect(result.invoice_details[2]).toEqual({
      detail_id: 'detail-003',
      product_name: 'サービスZ',
      quantity: 1,
      unit_price: 100000,
      subtotal: 100000,
    });

    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id: result.invoice_id,
        customer_name: 'テスト顧客A',
        invoice_amount: 300000,
      })
    );

    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id: result.invoice_id,
        customer_name: 'テスト顧客A',
      })
    );

    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(mockPaymentGateway.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id: result.invoice_id,
        amount: 300000,
      })
    );
  });
});