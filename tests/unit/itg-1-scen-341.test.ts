import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-341
  test('月次決算レポート生成機能 - 請求書紐付けステータスが0件のレコード存在するとき、未請求額として集計される', () => {
    const testSalesRecords = [
      {
        sales_id: 'SL001',
        sales_amount: 100000,
        invoice_linkage_status: 0,
        sales_date: new Date('2024-04-15T10:00:00Z'),
      },
      {
        sales_id: 'SL002',
        sales_amount: 50000,
        invoice_linkage_status: 1,
        sales_date: new Date('2024-04-20T14:30:00Z'),
      },
      {
        sales_id: 'SL003',
        sales_amount: 75000,
        invoice_linkage_status: 0,
        sales_date: new Date('2024-04-25T09:15:00Z'),
      },
    ];

    const targetMonth = '2024-04';

    const report = generateMonthlySettlementReport(testSalesRecords, targetMonth);

    expect(report.unbilled_amount_total).toBe(175000);
    expect(report.billed_amount_total).toBe(50000);
    expect(report.unbilled_records_count).toBe(2);
    expect(report.unbilled_records).toContainEqual(
      expect.objectContaining({
        sales_id: 'SL001',
        sales_amount: 100000,
        invoice_linkage_status: 0,
      })
    );
    expect(report.unbilled_records).toContainEqual(
      expect.objectContaining({
        sales_id: 'SL003',
        sales_amount: 75000,
        invoice_linkage_status: 0,
      })
    );
    expect(report.unbilled_records).not.toContainEqual(
      expect.objectContaining({
        sales_id: 'SL002',
      })
    );
  });
});