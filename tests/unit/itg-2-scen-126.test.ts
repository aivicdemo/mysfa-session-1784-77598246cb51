import {
  reapproveInvoice,
} from '../../src/logic/it-1784969823049-2-1-2';

// Mock adapters
interface DocumentStorageAdapterStub {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface NotificationServiceAdapterStub {
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  sendInvoiceNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
}

interface AuditLogExporterStub {
  logUserAccess: jest.Mock;
  logDataAccess: jest.Mock;
  logPermissionChange: jest.Mock;
  queryAuditLog: jest.Mock;
}

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-126
  test('ステータスが「差戻し」の請求書に対して再承認処理を実行し、ステータスが「承認済み」に更新される', async () => {
    // Arrange
    const invoice_id = 'INV-2024-00156';
    const customer_id = 'CUST-00042';
    const user_id = 'USR-00098';
    const invoice_amount = 150000;
    const invoice_date = '2024-03-15T09:30:00Z';
    const reapproval_timestamp = '2024-03-15T14:45:00Z';

    const input_invoice = {
      invoice_id,
      customer_id,
      status: '差戻し',
      amount: invoice_amount,
      invoice_date,
      line_items: [
        {
          item_id: 'ITEM-001',
          product_name: 'コンサルティングサービス',
          quantity: 1,
          unit_price: 100000,
          tax_amount: 10000,
          line_total: 110000,
        },
        {
          item_id: 'ITEM-002',
          product_name: 'サポート費用',
          quantity: 1,
          unit_price: 40000,
          tax_amount: 4000,
          line_total: 44000,
        },
      ],
      customer_email: 'contact@customer.example.com',
      customer_name: 'テスト顧客株式会社',
    };

    const documentStorageStub: DocumentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_url: 'https://storage.example.com/inv-2024-00156-reapproved.pdf',
        file_id: 'FILE-9876543210',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://storage.example.com/share/abc123def456',
        expiration_time: '2024-03-22T14:45:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const notificationServiceStub: NotificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ message_id: 'MSG-001' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ message_id: 'MSG-002' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        message_id: 'MSG-003',
        recipient: input_invoice.customer_email,
        sent_time: reapproval_timestamp,
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        opened_time: '2024-03-15T15:00:00Z',
      }),
    };

    const auditLogExporterStub: AuditLogExporterStub = {
      logUserAccess: jest
        .fn()
        .mockResolvedValue({ log_id: 'LOG-ACCESS-001' }),
      logDataAccess: jest.fn().mockResolvedValue({
        log_id: 'LOG-DATA-ACCESS-001',
        user_id,
        data_type: 'invoice',
        action: 'reapprove',
        timestamp: reapproval_timestamp,
      }),
      logPermissionChange: jest
        .fn()
        .mockResolvedValue({ log_id: 'LOG-PERM-001' }),
      queryAuditLog: jest.fn().mockResolvedValue([]),
    };

    // Act
    const result = await reapproveInvoice(
      input_invoice,
      user_id,
      documentStorageStub,
      notificationServiceStub,
      auditLogExporterStub
    );

    // Assert
    expect(result.success).toBe(true);
    expect(result.invoice_status).toBe('承認済み');
    expect(result.message).toBe('請求書の再承認が完了しました');
    expect(result.updated_at).toBe(reapproval_timestamp);

    expect(documentStorageStub.uploadDocument).toHaveBeenCalledTimes(1);
    expect(documentStorageStub.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id,
        file_name: expect.stringContaining('INV-2024-00156'),
      })
    );

    expect(notificationServiceStub.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(notificationServiceStub.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id,
        customer_email: input_invoice.customer_email,
        customer_name: input_invoice.customer_name,
      })
    );

    expect(auditLogExporterStub.logDataAccess).toHaveBeenCalledTimes(1);
    expect(auditLogExporterStub.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id,
        data_type: 'invoice',
        action: 'reapprove',
        invoice_id,
      })
    );

    expect(result.document_url).toBe(
      'https://storage.example.com/inv-2024-00156-reapproved.pdf'
    );
  });
});