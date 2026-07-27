import { updateDealStatusAndGenerateInvoice } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-225: [normal] 商談ステータス更新・請求データ紐付け機能 - 商談ステータスを成約に変更する際、複数の明細行がある場合に各明細の金額が正確に請求明細に反映される
  test('should update deal status to contracted and create invoice with accurate line items', () => {
    // Arrange
    const deal_id = 'DEAL-001';
    const customer_id = 'CUST-001';
    const customer_email = 'customer@example.com';
    const customer_name = '株式会社サンプル';

    const line_item_1 = {
      product_name: '商品A',
      unit_price: 10000,
      quantity: 2,
      subtotal: 20000,
    };

    const line_item_2 = {
      product_name: '商品B',
      unit_price: 15000,
      quantity: 3,
      subtotal: 45000,
    };

    const line_item_3 = {
      product_name: '商品C',
      unit_price: 5000,
      quantity: 4,
      subtotal: 20000,
    };

    const deal = {
      id: deal_id,
      customer_id: customer_id,
      customer_email: customer_email,
      customer_name: customer_name,
      status: '交渉中',
      amount: 85000,
      line_items: [line_item_1, line_item_2, line_item_3],
    };

    const mock_document_storage_adapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC-001',
        file_url: 'https://storage.example.com/invoice-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://storage.example.com/share/link-001',
      }),
      deleteDocument: jest.fn().mockResolvedValue({}),
    };

    const mock_notification_service_adapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        message_id: 'MSG-001',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        message_id: 'MSG-002',
        status: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        message_id: 'MSG-003',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
        opened: false,
      }),
    };

    const mock_payment_gateway_adapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link_id: 'LINK-001',
        payment_url: 'https://payment.example.com/checkout/LINK-001',
        expires_at: '2024-02-15T11:00:00Z',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transaction_id: 'TXN-001',
        status: 'completed',
        amount: 85000,
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: 'pending',
        amount: 85000,
      }),
    };

    // Act
    const result = updateDealStatusAndGenerateInvoice(
      deal,
      '成約',
      {
        uploadDocument: mock_document_storage_adapter.uploadDocument,
        generateShareLink: mock_document_storage_adapter.generateShareLink,
        deleteDocument: mock_document_storage_adapter.deleteDocument,
      },
      {
        sendQuoteNotification: mock_notification_service_adapter.sendQuoteNotification,
        sendOrderNotification: mock_notification_service_adapter.sendOrderNotification,
        sendInvoiceNotification: mock_notification_service_adapter.sendInvoiceNotification,
        getDeliveryStatus: mock_notification_service_adapter.getDeliveryStatus,
      },
      {
        generatePaymentLink: mock_payment_gateway_adapter.generatePaymentLink,
        verifyPayment: mock_payment_gateway_adapter.verifyPayment,
        getTransactionStatus: mock_payment_gateway_adapter.getTransactionStatus,
      }
    );

    // Assert
    expect(result.updated_deal.status).toBe('成約');
    expect(result.updated_deal.id).toBe(deal_id);

    expect(result.invoice).toBeDefined();
    expect(result.invoice.status).toBe('発行待ち');
    expect(result.invoice.total_amount).toBe(85000);
    expect(result.invoice.customer_id).toBe(customer_id);
    expect(result.invoice.customer_email).toBe(customer_email);
    expect(result.invoice.customer_name).toBe(customer_name);

    expect(result.invoice.line_items).toHaveLength(3);

    expect(result.invoice.line_items[0]).toEqual({
      product_name: '商品A',
      unit_price: 10000,
      quantity: 2,
      amount: 20000,
    });

    expect(result.invoice.line_items[1]).toEqual({
      product_name: '商品B',
      unit_price: 15000,
      quantity: 3,
      amount: 45000,
    });

    expect(result.invoice.line_items[2]).toEqual({
      product_name: '商品C',
      unit_price: 5000,
      quantity: 4,
      amount: 20000,
    });

    const total_line_items_amount =
      result.invoice.line_items.reduce(
        (sum: number, item: { amount: number }) => sum + item.amount,
        0
      );
    expect(total_line_items_amount).toBe(85000);

    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        document_type: 'invoice',
        invoice_id: result.invoice.id,
      })
    );

    expect(mock_notification_service_adapter.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(mock_notification_service_adapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: customer_email,
        invoice_id: result.invoice.id,
      })
    );

    expect(mock_payment_gateway_adapter.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(mock_payment_gateway_adapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id: result.invoice.id,
      })
    );
  });
});