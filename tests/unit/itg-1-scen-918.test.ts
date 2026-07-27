import { describe, test, expect } from '@jest/globals';
import { reconcileSalesAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求データ照合機能', () => {
  // SCEN-918
  test('売上計上予定日が請求日より後の場合、ズレが検出される', () => {
    const salesRecord = {
      sales_id: 'SO-001',
      customer_name: '顧客A',
      sales_amount: 100000,
      accrual_planned_date: new Date('2024-02-15T00:00:00Z'),
    };

    const invoiceRecord = {
      invoice_id: 'INV-001',
      sales_id: 'SO-001',
      invoice_amount: 100000,
      invoice_date: new Date('2024-02-10T00:00:00Z'),
    };

    const reconciliationPeriod = {
      start_date: new Date('2024-02-01T00:00:00Z'),
      end_date: new Date('2024-02-29T00:00:00Z'),
    };

    const result = reconcileSalesAndInvoice([salesRecord], [invoiceRecord], reconciliationPeriod);

    expect(result).toEqual(
      expect.objectContaining({
        discrepancies: expect.arrayContaining([
          expect.objectContaining({
            sales_id: 'SO-001',
            discrepancy_type: '売上計上予定日 > 請求日',
            gap_days: 5,
            status: '要確認',
          }),
        ]),
      })
    );
  });
});