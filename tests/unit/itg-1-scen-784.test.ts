import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-784
  test('期間開始日が期間終了日を超えるとき、エラーが発生する', () => {
    const startDate = new Date('2024-12-31T00:00:00Z');
    const endDate = new Date('2024-12-25T00:00:00Z');

    expect(() =>
      extractBillingTargetData({
        startDate,
        endDate,
      })
    ).toThrow(/期間開始日/);
  });
});