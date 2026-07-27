import { describe, test, expect, beforeEach } from '@jest/globals';
import { reconcileSalesAndInvoiceData } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求データ照合機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-921
  test('商談ステータスが「受注」「完了」以外の場合、照合対象外として除外される', () => {
    const dealRecords = [
      {
        deal_id: 'DEAL001',
        status: '受注',
        sales_amount: 100000,
        invoice_amount: 100000,
        deal_name: '商談1',
      },
      {
        deal_id: 'DEAL002',
        status: '見積中',
        sales_amount: 50000,
        invoice_amount: 50000,
        deal_name: '商談2',
      },
      {
        deal_id: 'DEAL003',
        status: '完了',
        sales_amount: 200000,
        invoice_amount: 200000,
        deal_name: '商談3',
      },
    ];

    const result = reconcileSalesAndInvoiceData(dealRecords);

    expect(result.included_records).toHaveLength(2);
    expect(result.included_records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ deal_id: 'DEAL001', status: '受注' }),
        expect.objectContaining({ deal_id: 'DEAL003', status: '完了' }),
      ])
    );

    expect(result.total_sales_amount).toBe(300000);
    expect(result.total_invoice_amount).toBe(300000);

    expect(result.excluded_records).toHaveLength(1);
    expect(result.excluded_records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deal_id: 'DEAL002',
          status: '見積中',
          exclusion_reason: 'ステータスが照合対象外（見積中）',
        }),
      ])
    );
  });
});