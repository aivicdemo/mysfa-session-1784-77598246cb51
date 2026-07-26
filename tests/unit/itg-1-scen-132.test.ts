import { validateMonthlyReportData } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-132
  test('月次営業成績報告書の売上・請求データ検証 - 報告書の売上金額とシステム元データが完全に一致する場合、検証完了と判定される', () => {
    // テスト用の営業管理システムからの売上・請求データ
    const system_sales_data = [
      {
        transaction_id: 'TX-2024-01-001',
        customer_id: 'CUST-001',
        customer_name: '顧客企業A',
        deal_status: '受注',
        deal_amount: 500000,
        billing_date: '2024-01-15',
        billing_amount: 500000,
      },
      {
        transaction_id: 'TX-2024-01-002',
        customer_id: 'CUST-002',
        customer_name: '顧客企業B',
        deal_status: '受注',
        deal_amount: 300000,
        billing_date: '2024-01-20',
        billing_amount: 300000,
      },
      {
        transaction_id: 'TX-2024-01-003',
        customer_id: 'CUST-003',
        customer_name: '顧客企業C',
        deal_status: '完了',
        deal_amount: 200000,
        billing_date: '2024-01-25',
        billing_amount: 200000,
      },
    ];

    // システムからの売上合計を計算
    const system_total_sales = system_sales_data.reduce(
      (sum, record) => sum + record.deal_amount,
      0
    );

    // システムからの請求合計を計算
    const system_total_billing = system_sales_data.reduce(
      (sum, record) => sum + record.billing_amount,
      0
    );

    // 受注件数
    const system_received_orders_count = system_sales_data.filter(
      (record) => record.deal_status === '受注'
    ).length;

    // 提案数（この例では全件が提案状態から受注に至ったと仮定）
    const system_proposal_count = system_sales_data.length;

    // 進捗率 = 受注数 ÷ 提案数
    const system_progress_rate =
      system_proposal_count > 0
        ? (system_received_orders_count / system_proposal_count) * 100
        : 0;

    // 生成された月次営業成績報告書のデータ
    const generated_report = {
      report_id: 'RPT-2024-01-001',
      report_period_start: '2024-01-01',
      report_period_end: '2024-01-31',
      total_sales_amount: 1000000,
      received_orders_count: 2,
      proposal_count: 3,
      progress_rate: 66.67,
      billing_total_amount: 1000000,
      billing_details: [
        {
          customer_id: 'CUST-001',
          customer_name: '顧客企業A',
          billing_amount: 500000,
        },
        {
          customer_id: 'CUST-002',
          customer_name: '顧客企業B',
          billing_amount: 300000,
        },
        {
          customer_id: 'CUST-003',
          customer_name: '顧客企業C',
          billing_amount: 200000,
        },
      ],
    };

    // 検証用入力データ
    const validation_input = {
      report_data: generated_report,
      system_sales_data: system_sales_data,
      report_period_start: '2024-01-01',
      report_period_end: '2024-01-31',
    };

    // validateMonthlyReportData 関数を実行
    const validation_result = validateMonthlyReportData(validation_input);

    // 期待値の計算
    const expected_total_sales = 1000000; // 500000 + 300000 + 200000
    const expected_billing_total = 1000000;
    const expected_received_orders = 2;
    const expected_proposal_count = 3;
    const expected_progress_rate = 66.67; // (2 / 3) * 100 = 66.67

    // 検証結果の確認
    expect(validation_result.validation_status).toBe('完了');
    expect(validation_result.is_valid).toBe(true);
    expect(validation_result.total_sales_match).toBe(true);
    expect(validation_result.report_total_sales).toBe(expected_total_sales);
    expect(validation_result.system_total_sales).toBe(expected_total_sales);
    expect(validation_result.billing_amount_match).toBe(true);
    expect(validation_result.report_total_billing).toBe(expected_billing_total);
    expect(validation_result.system_total_billing).toBe(expected_billing_total);
    expect(validation_result.received_orders_match).toBe(true);
    expect(validation_result.report_received_orders).toBe(expected_received_orders);
    expect(validation_result.system_received_orders).toBe(expected_received_orders);
    expect(validation_result.proposal_count_match).toBe(true);
    expect(validation_result.report_proposal_count).toBe(expected_proposal_count);
    expect(validation_result.system_proposal_count).toBe(expected_proposal_count);
    expect(validation_result.progress_rate_match).toBe(true);
    expect(validation_result.report_progress_rate).toBeCloseTo(
      expected_progress_rate,
      2
    );
    expect(validation_result.system_progress_rate).toBeCloseTo(
      expected_progress_rate,
      2
    );
    expect(validation_result.discrepancy_items).toEqual([]);
    expect(validation_result.validation_timestamp).toBeDefined();
    expect(validation_result.approved_for_submission).toBe(true);
  });
});