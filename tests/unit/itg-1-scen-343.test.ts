import { generateMonthlyReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-343: [normal] 月次決算レポート生成機能 - 請求書紐付けステータスが複数件のレコード（1つの商談に複数の請求書が紐付く）存在するとき、すべての請求金額が集計される
  test('複数の請求書が1つの商談に紐付くとき、すべての請求金額が集計される', () => {
    const deal_id = 'DEAL-001';
    const invoice_1_amount = 100000;
    const invoice_2_amount = 50000;
    const invoice_3_amount = 75000;
    const expected_total_amount = 225000;
    const report_month = '2024-04';

    const input_deals = [
      {
        deal_id: deal_id,
        customer_id: 'CUST-001',
        deal_amount: 225000,
        deal_status: 'won',
        created_date: '2024-04-01',
      },
    ];

    const input_invoices = [
      {
        invoice_id: 'INV-001',
        deal_id: deal_id,
        amount: invoice_1_amount,
        status: 'issued',
        issued_date: '2024-04-05',
      },
      {
        invoice_id: 'INV-002',
        deal_id: deal_id,
        amount: invoice_2_amount,
        status: 'issued',
        issued_date: '2024-04-10',
      },
      {
        invoice_id: 'INV-003',
        deal_id: deal_id,
        amount: invoice_3_amount,
        status: 'issued',
        issued_date: '2024-04-15',
      },
    ];

    const report = generateMonthlyReport({
      deals: input_deals,
      invoices: input_invoices,
      report_month: report_month,
    });

    const aggregated_deal = report.deals.find(
      (d: { deal_id: string }) => d.deal_id === deal_id
    );

    expect(aggregated_deal).toBeDefined();
    expect(aggregated_deal.aggregated_invoice_amount).toBe(expected_total_amount);
    expect(aggregated_deal.invoice_count).toBe(3);
  });
});