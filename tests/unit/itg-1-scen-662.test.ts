import { calculateDateDifference } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-662
  test('年度をまたぐとき、売上計上予定日と請求書発行日のズレ日数が正確に計算される', () => {
    const planned_revenue_date = new Date('2024-03-25T00:00:00Z');
    const invoice_issued_date = new Date('2025-04-10T00:00:00Z');

    const difference_days = calculateDateDifference(
      planned_revenue_date,
      invoice_issued_date
    );

    expect(difference_days).toBe(742);
  });
});