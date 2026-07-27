import { aggregateMonthlyMetrics } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-158: [edge] 当月集計結果の月判定 - 前月最終日に登録された商談が当月集計に含まれない
  test('前月最終日に登録された商談が当月集計に含まれないこと', () => {
    // 集計開始日時：当月初日の00:00:00（例：2024年2月1日00:00:00）
    const aggregationStartTime = new Date('2024-02-01T00:00:00Z');

    // 商談登録：前月最終日の23:59:59に登録（例：2024年1月31日23:59:59）
    const dealRegisteredAtPreviousMonthEnd = new Date('2024-01-31T23:59:59Z');

    // システム時刻が当月初日に進んだ場合の集計実行時刻（例：2024年2月1日00:00:01）
    const aggregationExecutionTime = new Date('2024-02-01T00:00:01Z');

    // 前月最終日に登録された商談データ
    const previousMonthDeal = {
      dealId: 'DEAL-001',
      dealName: '前月最終日登録案件',
      amount: 1000000, // 100万円
      stage: '提案済み',
      registeredAt: dealRegisteredAtPreviousMonthEnd,
    };

    // 当月集計を実行（前月最終日の商談は含めない）
    const monthlyReport = aggregateMonthlyMetrics({
      deals: [previousMonthDeal],
      aggregationStartTime: aggregationStartTime,
      aggregationExecutionTime: aggregationExecutionTime,
      targetMonth: '2024-02',
    });

    // 期待結果：当月集計対象外として除外されている
    expect(monthlyReport.registeredDealCount).toBe(0);
    expect(monthlyReport.totalAmount).toBe(0);
    expect(monthlyReport.dealDetails).toEqual([]);
  });
});