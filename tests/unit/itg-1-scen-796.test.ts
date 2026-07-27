import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能 - 請求対象データ抽出', () => {
  // SCEN-796
  test('入力ステータスが無効な値のときエラーが発生する', () => {
    const invalidStatuses = [
      'INVALID_STATUS',
      '',
      null,
      undefined,
      '!!!',
    ];

    invalidStatuses.forEach((invalidStatus) => {
      expect(() =>
        extractBillingTargetData({
          status: invalidStatus as any,
          minAmount: 0,
          maxAmount: 10000000,
          periodStart: new Date('2024-01-01T00:00:00Z'),
          periodEnd: new Date('2024-01-31T23:59:59Z'),
        })
      ).toThrow(/ステータス|無効/i);
    });
  });
});