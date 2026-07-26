import { calculateROI } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-314
  test('Salesforceライセンス費用がゼロ円で入力された場合にROI計算エラーが適切に検出される', () => {
    const salesforce_license_cost = 0;
    const post_abolition_operation_cost = 500000;
    const cost_reduction_amount = 1200000;
    const initial_construction_cost = 2000000;

    expect(() =>
      calculateROI({
        salesforce_license_cost,
        post_abolition_operation_cost,
        cost_reduction_amount,
        initial_construction_cost,
      })
    ).toThrow(/ライセンス費用/);
  });
});