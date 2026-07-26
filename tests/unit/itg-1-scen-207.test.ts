import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  reconcileDealsWithInvoices,
} from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-207: [edge] 商談ステータスと請求書発行状況の自動照合機能 - ズレが0日（予定通り請求）の場合が正確に判定される
  test('ズレが0日の場合、ズレ日数が0日と判定され、請求書発行状況が「予定通り請求」として分類される', () => {
    const deal_id = 'DEAL-2024-001';
    const customer_id = 'CUST-001';
    const customer_name = 'テスト顧客株式会社';
    const deal_amount = 1500000;
    const planned_invoice_date = new Date('2024-01-15T00:00:00Z');
    const actual_invoice_date = new Date('2024-01-15T00:00:00Z');
    const deal_status = '受注';

    const input_deal = {
      deal_id: deal_id,
      customer_id: customer_id,
      customer_name: customer_name,
      deal_amount: deal_amount,
      planned_invoice_date: planned_invoice_date,
      actual_invoice_date: actual_invoice_date,
      deal_status: deal_status,
    };

    const result = reconcileDealsWithInvoices([input_deal]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      deal_id: deal_id,
      customer_id: customer_id,
      customer_name: customer_name,
      deal_amount: deal_amount,
      planned_invoice_date: planned_invoice_date,
      actual_invoice_date: actual_invoice_date,
      deal_status: deal_status,
      days_difference: 0,
      invoice_status: '予定通り請求',
      reconciliation_status: '正常',
      reconciliation_timestamp: expect.any(Date),
    });

    expect(result[0].days_difference).toBe(0);
    expect(result[0].invoice_status).toBe('予定通り請求');
    expect(result[0].reconciliation_status).toBe('正常');
    expect(result[0].reconciliation_timestamp).toBeInstanceOf(Date);
  });
});