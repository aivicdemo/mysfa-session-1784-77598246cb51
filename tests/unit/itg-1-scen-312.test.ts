import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-312
  test('[normal] 月次決算レポート生成機能 - 対象期間内に商談レコードが1件のとき、その1件の金額が売上実績に正確に集計される', () => {
    const targetPeriodStart = new Date('2024-01-01T00:00:00Z');
    const targetPeriodEnd = new Date('2024-01-31T23:59:59Z');

    const dealRecord = {
      dealId: 'SD-001',
      dealName: 'テスト商談',
      amount: 1500000,
      status: '確定',
      confirmedDate: new Date('2024-01-15T00:00:00Z'),
    };

    const inputData = {
      targetPeriodStart,
      targetPeriodEnd,
      dealRecords: [dealRecord],
    };

    const result = generateMonthlySettlementReport(inputData);

    expect(result.salesPerformance).toEqual({
      recordCount: 1,
      totalAmount: 1500000,
      items: [
        {
          dealId: 'SD-001',
          dealName: 'テスト商談',
          amount: 1500000,
          status: '確定',
          confirmedDate: new Date('2024-01-15T00:00:00Z'),
        },
      ],
    });

    expect(result.reportPeriod).toEqual({
      start: targetPeriodStart,
      end: targetPeriodEnd,
    });
  });
});