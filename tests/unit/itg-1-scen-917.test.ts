import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { reconcileSalesAndInvoiceData } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-917: [normal] 売上実績・請求データ照合機能 - 売上計上予定日が請求日より前の場合、ズレが検出される
  it('売上計上予定日が請求日より5日前の場合、ズレが検出される', () => {
    const sales_accrual_expected_date = new Date('2024-01-15T00:00:00Z');
    const invoice_issued_date = new Date('2024-01-20T00:00:00Z');
    const amount = 100000;

    const sales_data = {
      sales_id: 'SALES-001',
      accrual_expected_date: sales_accrual_expected_date,
      amount: amount,
      deal_status: 'completed'
    };

    const invoice_data = {
      invoice_id: 'INV-001',
      issued_date: invoice_issued_date,
      amount: amount,
      customer_id: 'CUST-001'
    };

    const reconciliation_result = reconcileSalesAndInvoiceData([sales_data], [invoice_data]);

    expect(reconciliation_result).toEqual(
      expect.objectContaining({
        discrepancy_list: expect.arrayContaining([
          expect.objectContaining({
            sales_id: 'SALES-001',
            invoice_id: 'INV-001',
            discrepancy_type: '計上予定日が請求日より前',
            discrepancy_days: 5,
            status: '未対応'
          })
        ])
      })
    );
  });
});