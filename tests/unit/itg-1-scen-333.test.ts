import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-333
  test('月次決算レポート生成機能 - 同一期間・同一条件で2回実行されたとき、同じ集計結果が返される', () => {
    const test_period_start = new Date('2024-01-01T00:00:00Z');
    const test_period_end = new Date('2024-01-31T23:59:59Z');
    const test_report_mode = 'normal';

    const mock_sales_data = [
      {
        product_id: 'PROD_A',
        product_name: 'product_a',
        sales_amount: 1000000,
        transaction_date: '2024-01-15',
      },
      {
        product_id: 'PROD_B',
        product_name: 'product_b',
        sales_amount: 500000,
        transaction_date: '2024-01-20',
      },
      {
        product_id: 'PROD_OTHER',
        product_name: 'product_other',
        sales_amount: 300000,
        transaction_date: '2024-01-25',
      },
    ];

    const mock_salesforce_data_source = {
      fetchLicenseUsers: jest.fn().mockResolvedValue({
        users: [
          { user_id: 'USR_001', edition: 'Professional' },
          { user_id: 'USR_002', edition: 'Enterprise' },
        ],
      }),
      fetchEditionDetails: jest.fn().mockResolvedValue({
        editions: [
          { edition_name: 'Professional', contract_count: 50, used_count: 45 },
          { edition_name: 'Enterprise', contract_count: 20, used_count: 20 },
        ],
      }),
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue({
        features: [
          { feature_name: 'api_calls', usage_rate: 0.75 },
          { feature_name: 'storage', usage_rate: 0.60 },
        ],
      }),
      fetchAnnualCostData: jest.fn().mockResolvedValue({
        annual_cost: 5000000,
        renewal_date: '2024-12-31',
      }),
    };

    const mock_notification_service = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notification_id: 'NOTIF_001',
        status: 'sent',
      }),
    };

    const mock_document_storage = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC_001',
        storage_path: '/reports/2024-01-settlement.pdf',
      }),
    };

    const first_report = generateMonthlySettlementReport(
      test_period_start,
      test_period_end,
      test_report_mode,
      mock_sales_data,
      mock_salesforce_data_source,
      mock_notification_service,
      mock_document_storage
    );

    const first_total_sales = first_report.aggregation_results.total_sales;
    const first_product_breakdown = first_report.aggregation_results.product_breakdown;
    const first_period_start = first_report.aggregation_results.period_start;
    const first_period_end = first_report.aggregation_results.period_end;
    const first_record_count = first_report.aggregation_results.record_count;

    expect(first_total_sales).toBe(1800000);
    expect(first_product_breakdown).toEqual({
      product_a: 1000000,
      product_b: 500000,
      product_other: 300000,
    });
    expect(first_period_start).toEqual('2024-01-01T00:00:00Z');
    expect(first_period_end).toEqual('2024-01-31T23:59:59Z');
    expect(first_record_count).toBe(3);

    const second_report = generateMonthlySettlementReport(
      test_period_start,
      test_period_end,
      test_report_mode,
      mock_sales_data,
      mock_salesforce_data_source,
      mock_notification_service,
      mock_document_storage
    );

    const second_total_sales = second_report.aggregation_results.total_sales;
    const second_product_breakdown = second_report.aggregation_results.product_breakdown;
    const second_period_start = second_report.aggregation_results.period_start;
    const second_period_end = second_report.aggregation_results.period_end;
    const second_record_count = second_report.aggregation_results.record_count;

    expect(second_total_sales).toBe(1800000);
    expect(second_product_breakdown).toEqual({
      product_a: 1000000,
      product_b: 500000,
      product_other: 300000,
    });
    expect(second_period_start).toEqual('2024-01-01T00:00:00Z');
    expect(second_period_end).toEqual('2024-01-31T23:59:59Z');
    expect(second_record_count).toBe(3);

    expect(first_total_sales).toBe(second_total_sales);
    expect(first_product_breakdown).toEqual(second_product_breakdown);
    expect(first_period_start).toBe(second_period_start);
    expect(first_period_end).toBe(second_period_end);
    expect(first_record_count).toBe(second_record_count);
  });
});