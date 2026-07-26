import { generateMonthlyReportDocument } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-122
  test('月次営業成績報告書が統一フォーマットで生成され、売上・件数・進捗率・顧客別詳細の必須項目がすべて記載される', () => {
    const input_reporting_month = '2024-04';
    const input_department_id = 'DEPT001';
    const input_target_sales = 5000000;

    const input_deals = [
      {
        deal_id: 'DEAL001',
        customer_id: 'CUST001',
        customer_name: 'Example Corp A',
        amount: 1500000,
        status: '受注',
        deal_date: '2024-04-05'
      },
      {
        deal_id: 'DEAL002',
        customer_id: 'CUST002',
        customer_name: 'Example Corp B',
        amount: 2000000,
        status: '受注',
        deal_date: '2024-04-10'
      },
      {
        deal_id: 'DEAL003',
        customer_id: 'CUST003',
        customer_name: 'Example Corp C',
        amount: 1200000,
        status: '受注',
        deal_date: '2024-04-15'
      },
      {
        deal_id: 'DEAL004',
        customer_id: 'CUST001',
        customer_name: 'Example Corp A',
        amount: 800000,
        status: '提案中',
        deal_date: '2024-04-20'
      },
      {
        deal_id: 'DEAL005',
        customer_id: 'CUST004',
        customer_name: 'Example Corp D',
        amount: 0,
        status: '失注',
        deal_date: '2024-04-25'
      }
    ];

    const input_customer_details = [
      {
        customer_id: 'CUST001',
        customer_name: 'Example Corp A',
        total_sales: 2300000,
        deals_by_status: {
          '受注': { count: 1, amount: 1500000 },
          '提案中': { count: 1, amount: 800000 },
          '失注': { count: 0, amount: 0 }
        }
      },
      {
        customer_id: 'CUST002',
        customer_name: 'Example Corp B',
        total_sales: 2000000,
        deals_by_status: {
          '受注': { count: 1, amount: 2000000 },
          '提案中': { count: 0, amount: 0 },
          '失注': { count: 0, amount: 0 }
        }
      },
      {
        customer_id: 'CUST003',
        customer_name: 'Example Corp C',
        total_sales: 1200000,
        deals_by_status: {
          '受注': { count: 1, amount: 1200000 },
          '提案中': { count: 0, amount: 0 },
          '失注': { count: 0, amount: 0 }
        }
      },
      {
        customer_id: 'CUST004',
        customer_name: 'Example Corp D',
        total_sales: 0,
        deals_by_status: {
          '受注': { count: 0, amount: 0 },
          '提案中': { count: 0, amount: 0 },
          '失注': { count: 1, amount: 0 }
        }
      }
    ];

    const result = generateMonthlyReportDocument({
      reporting_month: input_reporting_month,
      department_id: input_department_id,
      target_sales: input_target_sales,
      deals: input_deals,
      customer_details: input_customer_details
    });

    expect(result).toBeDefined();
    expect(result.format).toBe('統一フォーマット');
    expect(result.reporting_month).toBe('2024-04');
    expect(result.department_id).toBe('DEPT001');

    // 売上情報の検証: 合計売上 = 1500000 + 2000000 + 1200000 = 4700000
    const expected_total_sales = 4700000;
    expect(result.summary.total_sales).toBe(expected_total_sales);
    expect(result.summary.currency).toBe('JPY');

    // 件数情報の検証
    const expected_deal_count = 5;
    const expected_closed_count = 3;
    const expected_lost_count = 1;
    const expected_in_progress_count = 1;
    expect(result.summary.total_deal_count).toBe(expected_deal_count);
    expect(result.summary.closed_deal_count).toBe(expected_closed_count);
    expect(result.summary.lost_deal_count).toBe(expected_lost_count);
    expect(result.summary.in_progress_deal_count).toBe(expected_in_progress_count);

    // 進捗率の検証: 受注率 = 受注件数(3) / 提案件数(4) = 0.75 = 75%
    const expected_close_rate = 0.75;
    expect(result.summary.close_rate).toBe(expected_close_rate);

    // 達成率の検証: 達成率 = 売上(4700000) / 目標(5000000) = 0.94 = 94%
    const expected_achievement_rate = 0.94;
    expect(result.summary.achievement_rate).toBe(expected_achievement_rate);

    // 顧客別詳細が存在し、4件の顧客が記載されていることを確認
    expect(result.customer_details).toBeDefined();
    expect(result.customer_details.length).toBe(4);

    // 顧客別詳細の第1顧客検証
    const first_customer = result.customer_details[0];
    expect(first_customer.customer_id).toBe('CUST001');
    expect(first_customer.customer_name).toBe('Example Corp A');
    expect(first_customer.total_sales).toBe(2300000);
    expect(first_customer.deals_by_status['受注'].count).toBe(1);
    expect(first_customer.deals_by_status['受注'].amount).toBe(1500000);
    expect(first_customer.deals_by_status['提案中'].count).toBe(1);
    expect(first_customer.deals_by_status['提案中'].amount).toBe(800000);

    // 顧客別詳細の第2顧客検証
    const second_customer = result.customer_details[1];
    expect(second_customer.customer_id).toBe('CUST002');
    expect(second_customer.customer_name).toBe('Example Corp B');
    expect(second_customer.total_sales).toBe(2000000);
    expect(second_customer.deals_by_status['受注'].count).toBe(1);
    expect(second_customer.deals_by_status['受注'].amount).toBe(2000000);

    // ファイル情報の検証
    expect(result.file_info).toBeDefined();
    expect(result.file_info.filename).toMatch(/monthly_report_2024-04_DEPT001_\d{4}-\d{2}-\d{2}\.pdf/);
    expect(result.file_info.content_type).toBe('application/pdf');
    expect(result.file_info.is_downloadable).toBe(true);

    // 生成日時が設定されていることを確認（ISO形式の日付文字列）
    expect(result.generated_at).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/);

    // 必須項目の完全性チェック
    expect(result.required_fields_present).toBe(true);
    expect(result.required_fields_present_detail).toEqual({
      has_sales: true,
      has_deal_count: true,
      has_close_rate: true,
      has_customer_details: true
    });
  });
});