import { describe, test, expect, beforeEach } from '@jest/globals';
import { linkAndVisualizeDealWithInvoices } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-666
  test('商談ステータスが「受注」で紐付く請求書が複数件のとき、全ての請求書が紐付く', () => {
    const deal_id = 'DEAL-20240415-001';
    const deal_status = '受注';
    const deal_amount = 225000;
    const deal_close_date = new Date('2024-04-15T09:00:00Z');

    const invoice_1_id = 'INV-20240415-001';
    const invoice_1_amount = 100000;
    const invoice_1_date = new Date('2024-04-15T10:30:00Z');
    const invoice_1_status = '発行済み';

    const invoice_2_id = 'INV-20240415-002';
    const invoice_2_amount = 50000;
    const invoice_2_date = new Date('2024-04-15T11:00:00Z');
    const invoice_2_status = '発行済み';

    const invoice_3_id = 'INV-20240415-003';
    const invoice_3_amount = 75000;
    const invoice_3_date = new Date('2024-04-15T11:30:00Z');
    const invoice_3_status = '発行済み';

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        file_id: 'FILE-001',
        storage_path: '/documents/invoices/2024-04-15',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const dealRecord = {
      deal_id,
      deal_status,
      deal_amount,
      deal_close_date,
      customer_id: 'CUST-001',
      customer_name: 'テスト顧客A',
    };

    const invoiceRecords = [
      {
        invoice_id: invoice_1_id,
        deal_id,
        invoice_amount: invoice_1_amount,
        invoice_date: invoice_1_date,
        invoice_status: invoice_1_status,
      },
      {
        invoice_id: invoice_2_id,
        deal_id,
        invoice_amount: invoice_2_amount,
        invoice_date: invoice_2_date,
        invoice_status: invoice_2_status,
      },
      {
        invoice_id: invoice_3_id,
        deal_id,
        invoice_amount: invoice_3_amount,
        invoice_date: invoice_3_date,
        invoice_status: invoice_3_status,
      },
    ];

    const result = linkAndVisualizeDealWithInvoices(
      dealRecord,
      invoiceRecords,
      mockDocumentStorageAdapter,
    );

    expect(result.deal_id).toBe(deal_id);
    expect(result.deal_status).toBe('受注');
    expect(result.linked_invoices).toHaveLength(3);

    expect(result.linked_invoices[0]).toEqual(
      expect.objectContaining({
        invoice_id: invoice_1_id,
        deal_id,
        invoice_amount: invoice_1_amount,
        invoice_date: invoice_1_date,
        invoice_status: invoice_1_status,
      }),
    );

    expect(result.linked_invoices[1]).toEqual(
      expect.objectContaining({
        invoice_id: invoice_2_id,
        deal_id,
        invoice_amount: invoice_2_amount,
        invoice_date: invoice_2_date,
        invoice_status: invoice_2_status,
      }),
    );

    expect(result.linked_invoices[2]).toEqual(
      expect.objectContaining({
        invoice_id: invoice_3_id,
        deal_id,
        invoice_amount: invoice_3_amount,
        invoice_date: invoice_3_date,
        invoice_status: invoice_3_status,
      }),
    );

    const total_linked_amount =
      invoice_1_amount + invoice_2_amount + invoice_3_amount;
    expect(result.total_linked_invoice_amount).toBe(total_linked_amount);

    expect(result.is_fully_visualized).toBe(true);
  });
});