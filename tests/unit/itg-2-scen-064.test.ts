import { issuePurchaseOrder } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-064: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 注文書の発行日時が未来の日時のとき、その日時が記録される
  test('should record specified future issuance datetime in purchase order history', async () => {
    const current_datetime = new Date('2024-01-15T10:00:00Z');
    const specified_future_datetime = new Date('2024-01-15T10:30:00Z');
    const order_id = 'ORD-20240115-001';
    const customer_id = 'CUST-00001';
    const user_id = 'USR-00001';

    const mock_document_storage_adapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC-20240115-001',
        storage_url: 'https://storage.example.com/doc/DOC-20240115-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://share.example.com/DOC-20240115-001',
        expires_at: new Date('2024-01-22T10:30:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mock_notification_service_adapter = {
      sendOrderNotification: jest.fn().mockResolvedValue({
        email_id: 'NOTIF-20240115-001',
        sent_at: specified_future_datetime,
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendInvoiceNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
        opened: false,
      }),
    };

    const issuance_request = {
      order_id: order_id,
      customer_id: customer_id,
      issued_by_user_id: user_id,
      specified_issuance_datetime: specified_future_datetime,
      document_type: 'PURCHASE_ORDER',
      line_items: [
        {
          item_id: 'ITEM-001',
          product_name: 'Product A',
          quantity: 5,
          unit_price: 1000,
        },
        {
          item_id: 'ITEM-002',
          product_name: 'Product B',
          quantity: 3,
          unit_price: 2000,
        },
      ],
      customer_email: 'customer@example.com',
      customer_name: 'Example Customer Inc.',
    };

    const issuance_result = await issuePurchaseOrder(
      issuance_request,
      mock_document_storage_adapter,
      mock_notification_service_adapter,
    );

    expect(issuance_result.success).toBe(true);
    expect(issuance_result.issued_purchase_order.order_id).toBe(order_id);
    expect(issuance_result.issued_purchase_order.issuance_datetime).toEqual(
      specified_future_datetime,
    );
    expect(issuance_result.issued_purchase_order.issuance_datetime).not.toEqual(
      current_datetime,
    );

    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalledTimes(
      1,
    );
    expect(mock_notification_service_adapter.sendOrderNotification).toHaveBeenCalledTimes(
      1,
    );
    expect(
      mock_notification_service_adapter.sendOrderNotification,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient_email: 'customer@example.com',
        order_id: order_id,
      }),
    );

    expect(issuance_result.history_record.issuance_datetime).toBe(
      '2024-01-15T10:30:00Z',
    );
  });
});