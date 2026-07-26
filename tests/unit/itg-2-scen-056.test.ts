import { validateReportData } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照・報告書検証機能', () => {
  // SCEN-056
  test('報告書データ検証機能 - 報告書と元データの進捗率が小数第2位で異なる場合、許容範囲内として検証完了される', () => {
    const report_data = {
      deal_id: 'DEAL-001',
      customer_name: 'Test Customer',
      deal_amount: 1000000,
      deal_count: 5,
      progress_rate: 75.12,
      customer_details: [
        {
          customer_id: 'CUST-001',
          deal_status: 'Won',
          amount: 500000,
        },
        {
          customer_id: 'CUST-002',
          deal_status: 'In Progress',
          amount: 300000,
        },
      ],
      revenue: 500000,
    };

    const source_data = {
      deal_id: 'DEAL-001',
      customer_name: 'Test Customer',
      deal_amount: 1000000,
      deal_count: 5,
      progress_rate: 75.13,
      customer_details: [
        {
          customer_id: 'CUST-001',
          deal_status: 'Won',
          amount: 500000,
        },
        {
          customer_id: 'CUST-002',
          deal_status: 'In Progress',
          amount: 300000,
        },
      ],
      revenue: 500000,
    };

    const validation_result = validateReportData(report_data, source_data);

    expect(validation_result).toEqual({
      status: 'completed',
      is_valid: true,
      progress_rate_difference: 0.01,
      within_tolerance: true,
      tolerance_threshold: 0.01,
      error_message: null,
      validated_at: expect.any(String),
    });

    expect(validation_result.status).toBe('completed');
    expect(validation_result.is_valid).toBe(true);
    expect(validation_result.within_tolerance).toBe(true);
    expect(validation_result.progress_rate_difference).toBe(0.01);
    expect(validation_result.tolerance_threshold).toBe(0.01);
    expect(validation_result.error_message).toBeNull();
  });
});