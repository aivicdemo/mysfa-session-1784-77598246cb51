import { describe, test, expect, beforeEach } from '@jest/globals';
import { reconcileSalesAndInvoiceData } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-923: [edge] 売上実績・請求データ照合機能 - 対象の売上実績が1件の場合、その1件について照合結果が返される
  test('売上実績が1件の場合、その1件について完全一致の照合結果が返される', () => {
    const sales_record_id = 'SR001';
    const customer_id = 'CUST001';
    const sales_amount = 100000;
    const sales_date = '2024-01-15';
    const invoice_id = 'INV001';
    const invoice_amount = 100000;
    const invoice_date = '2024-01-15';
    const difference_amount = 0;
    const reconciliation_status = '完全一致';
    const is_matched = true;

    const sales_record = {
      sales_record_id: sales_record_id,
      customer_id: customer_id,
      sales_amount: sales_amount,
      sales_date: sales_date,
    };

    const invoice_record = {
      invoice_id: invoice_id,
      customer_id: customer_id,
      invoice_amount: invoice_amount,
      invoice_date: invoice_date,
    };

    const reconciliation_result = reconcileSalesAndInvoiceData(
      sales_record,
      invoice_record
    );

    expect(reconciliation_result).toEqual({
      sales_record_id: sales_record_id,
      invoice_id: invoice_id,
      reconciliation_status: reconciliation_status,
      sales_amount: sales_amount,
      invoice_amount: invoice_amount,
      difference_amount: difference_amount,
      is_matched: is_matched,
    });

    expect(reconciliation_result.sales_record_id).toBe('SR001');
    expect(reconciliation_result.invoice_id).toBe('INV001');
    expect(reconciliation_result.reconciliation_status).toBe('完全一致');
    expect(reconciliation_result.sales_amount).toBe(100000);
    expect(reconciliation_result.invoice_amount).toBe(100000);
    expect(reconciliation_result.difference_amount).toBe(0);
    expect(reconciliation_result.is_matched).toBe(true);
  });
});