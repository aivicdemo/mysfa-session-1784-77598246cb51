import { describe, test, expect } from '@jest/globals';
import { compareAndReportSalesAndBilling } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-227
  test('[error] 売上実績レコードが存在しない場合、比較処理がエラーで中止される', () => {
    const emptyActualPerformanceRecords: any[] = [];
    const billingRecords = [
      {
        billing_id: 'BIL-001',
        deal_id: 'DEAL-001',
        billing_date: '2024-04-15',
        billing_amount: 100000,
        customer_id: 'CUST-001',
      },
    ];

    expect(() =>
      compareAndReportSalesAndBilling({
        actual_performance_records: emptyActualPerformanceRecords,
        billing_records: billingRecords,
      })
    ).toThrow(/売上実績/);
  });
});