import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

interface DealRecord {
  customer_name: string;
  deal_amount: number;
  status: string;
  sales_planned_date: string;
}

interface InvoiceRecord {
  deal_id: string;
  customer_id: string;
  issue_date: string;
  invoice_amount: number;
  invoice_status: string;
}

interface ReconciliationResult {
  deal_id: string;
  customer_name: string;
  deal_amount: number;
  deal_status: string;
  sales_planned_date: string;
  invoice_issued_date: string;
  invoice_amount: number;
  match_status: string;
  reconciliation_status: string;
}

interface DocumentStorageAdapter {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface NotificationServiceAdapter {
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  sendInvoiceNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
}

interface ReconciliationInput {
  deals: DealRecord[];
  invoices: InvoiceRecord[];
}

// Import the logic function
import { reconcileSalesAndInvoiceData } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let documentStorageAdapter: DocumentStorageAdapter;
  let notificationServiceAdapter: NotificationServiceAdapter;

  beforeEach(() => {
    // Mock DocumentStorageAdapter
    documentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        file_id: 'doc_12345',
        url: 'https://drive.google.com/file/d/doc_12345/view'
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://drive.google.com/file/d/doc_12345/view?usp=sharing'
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true })
    };

    // Mock NotificationServiceAdapter
    notificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        message_id: 'msg_quote_001',
        status: 'sent'
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        message_id: 'msg_order_001',
        status: 'sent'
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        message_id: 'msg_invoice_001',
        status: 'sent'
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivery_status: 'delivered',
        open_timestamp: '2024-01-15T15:30:00Z'
      })
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-916
  test('[normal] 売上実績・請求データ照合機能 - 商談ステータスが「完了」で請求書が発行済みの場合、売上計上予定日と請求日が一致する', async () => {
    // Setup: Create test deal record with status "完了" and sales planned date 2024-01-15
    const test_deal: DealRecord = {
      customer_name: 'テスト商社A',
      deal_amount: 500000,
      status: '完了',
      sales_planned_date: '2024-01-15'
    };

    // Setup: Create test invoice record with issue date 2024-01-15
    const test_invoice: InvoiceRecord = {
      deal_id: 'DEAL_001',
      customer_id: 'CUST_001',
      issue_date: '2024-01-15',
      invoice_amount: 500000,
      invoice_status: '発行済み'
    };

    // Setup: Mock uploadDocument to return success
    const upload_response = {
      file_id: 'doc_invoice_001',
      url: 'https://drive.google.com/file/d/doc_invoice_001/view'
    };
    documentStorageAdapter.uploadDocument.mockResolvedValueOnce(upload_response);

    // Setup: Mock sendInvoiceNotification to return success
    const notification_response = {
      message_id: 'msg_invoice_20240115_001',
      status: 'sent'
    };
    notificationServiceAdapter.sendInvoiceNotification.mockResolvedValueOnce(notification_response);

    // Execute: Call reconciliation function with test data and mocked adapters
    const reconciliation_input: ReconciliationInput = {
      deals: [test_deal],
      invoices: [test_invoice]
    };

    const result: ReconciliationResult[] = await reconcileSalesAndInvoiceData(
      reconciliation_input,
      documentStorageAdapter,
      notificationServiceAdapter
    );

    // Verify: Check that uploadDocument was called when processing the deal
    expect(documentStorageAdapter.uploadDocument).toHaveBeenCalled();

    // Verify: Check that sendInvoiceNotification was called when issuing the invoice
    expect(notificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();

    // Verify: Reconciliation result should contain one record with matching dates
    expect(result).toHaveLength(1);

    const reconciliation_record = result[0];

    // Verify: Sales planned date matches invoice issue date
    expect(reconciliation_record.sales_planned_date).toBe('2024-01-15');
    expect(reconciliation_record.invoice_issued_date).toBe('2024-01-15');

    // Verify: Match status is '一致'
    expect(reconciliation_record.match_status).toBe('一致');

    // Verify: Reconciliation status is '正常'
    expect(reconciliation_record.reconciliation_status).toBe('正常');

    // Verify: Deal amount matches invoice amount
    expect(reconciliation_record.deal_amount).toBe(500000);
    expect(reconciliation_record.invoice_amount).toBe(500000);

    // Verify: Customer name is preserved
    expect(reconciliation_record.customer_name).toBe('テスト商社A');

    // Verify: Deal status is '完了'
    expect(reconciliation_record.deal_status).toBe('完了');

    // Verify: Invoice status is '発行済み'
    expect(reconciliation_record.invoice_status).toBe('発行済み');
  });
});