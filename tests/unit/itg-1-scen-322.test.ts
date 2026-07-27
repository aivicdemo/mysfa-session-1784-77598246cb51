import { generateMonthlyFinancialReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-322
  test('年度をまたぐ期間が指定されたとき、両年度のレコードが正確に集計される', () => {
    const prior_fiscal_records = [
      {
        sales_date: '2024-03-25',
        amount: 100000,
        fiscal_year: '2023',
      },
      {
        sales_date: '2024-03-26',
        amount: 100000,
        fiscal_year: '2023',
      },
      {
        sales_date: '2024-03-27',
        amount: 100000,
        fiscal_year: '2023',
      },
      {
        sales_date: '2024-03-30',
        amount: 100000,
        fiscal_year: '2023',
      },
      {
        sales_date: '2024-03-31',
        amount: 100000,
        fiscal_year: '2023',
      },
    ];

    const current_fiscal_records = [
      {
        sales_date: '2024-04-01',
        amount: 150000,
        fiscal_year: '2024',
      },
      {
        sales_date: '2024-04-02',
        amount: 150000,
        fiscal_year: '2024',
      },
      {
        sales_date: '2024-04-03',
        amount: 150000,
        fiscal_year: '2024',
      },
    ];

    const all_sales_records = [...prior_fiscal_records, ...current_fiscal_records];

    const report = generateMonthlyFinancialReport(
      all_sales_records,
      '2024-03-25',
      '2024-04-05'
    );

    const prior_fiscal_year_data = report.fiscal_year_breakdown.find(
      (fy) => fy.fiscal_year === '2023'
    );
    const current_fiscal_year_data = report.fiscal_year_breakdown.find(
      (fy) => fy.fiscal_year === '2024'
    );

    expect(prior_fiscal_year_data).toBeDefined();
    expect(prior_fiscal_year_data?.record_count).toBe(2);
    expect(prior_fiscal_year_data?.total_amount).toBe(200000);
    expect(prior_fiscal_year_data?.fiscal_year_flag).toBe('2023年度');

    expect(current_fiscal_year_data).toBeDefined();
    expect(current_fiscal_year_data?.record_count).toBe(2);
    expect(current_fiscal_year_data?.total_amount).toBe(300000);
    expect(current_fiscal_year_data?.fiscal_year_flag).toBe('2024年度');

    expect(report.total_records_in_period).toBe(4);
    expect(report.total_amount_in_period).toBe(500000);
  });
});