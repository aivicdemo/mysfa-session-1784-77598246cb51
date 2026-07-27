import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { recordInvoiceIssuance } from '../../src/logic/it-1784969823049-2-1-2';

const fetchMock = require('jest-fetch-mock');

describe('顧客向けポータル - 商談情報参照機能', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-083: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 請求書の発行履歴に営業担当者IDが正確に記録される
  test('SCEN-083: 請求書発行時に営業担当者IDが発行履歴に正確に記録される', async () => {
    const sales_staff_id = 'user_sales_001';
    const customer_id = 'cust_001';
    const invoice_amount = 100000;
    const period_start = '2024-01-01';
    const period_end = '2024-01-31';
    const issued_at_fixed = new Date('2024-02-15T10:30:00Z');
    const document_file_id = 'doc_20240215_001';

    // DocumentStorageAdapter のスタブ
    const mock_document_storage_adapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        file_id: document_file_id,
        url: 'https://storage.example.com/doc_20240215_001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://share.example.com/abc123',
      }),
      deleteDocument: jest.fn().mockResolvedValue({}),
    };

    // NotificationServiceAdapter のスタブ
    const mock_notification_service_adapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        message_id: 'msg_20240215_001',
        delivery_status: 'sent',
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({}),
    };

    // モック時刻取得関数
    const mock_get_current_timestamp = jest.fn().mockReturnValue(issued_at_fixed);

    // テスト対象関数を呼び出し
    const result = await recordInvoiceIssuance(
      {
        sales_staff_id,
        customer_id,
        invoice_amount,
        period_start,
        period_end,
      },
      mock_document_storage_adapter,
      mock_notification_service_adapter,
      mock_get_current_timestamp
    );

    // 期待値の検証
    expect(result).toBeDefined();
    expect(result.invoice_id).toBeDefined();
    expect(result.issued_at).toEqual(issued_at_fixed);
    expect(result.sales_staff_id).toBe(sales_staff_id);
    expect(result.customer_id).toBe(customer_id);
    expect(result.invoice_amount).toBe(invoice_amount);
    expect(result.document_file_id).toBe(document_file_id);

    // DocumentStorageAdapter.uploadDocument が呼び出されたことを確認
    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalled();

    // NotificationServiceAdapter.sendInvoiceNotification が呼び出されたことを確認
    expect(mock_notification_service_adapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id,
        invoice_id: result.invoice_id,
        invoice_amount,
      })
    );

    // 発行履歴に営業担当者IDが正確に記録されていることを確認
    expect(result.sales_staff_id).toBe('user_sales_001');
  });
});