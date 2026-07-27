import { checkDueDateDeviation } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-292
  test('売上計上予定日が月末のとき、期日ズレの判定が正常に実行される', () => {
    const accrual_date = new Date('2024-01-31T00:00:00Z');
    const billing_date = new Date('2024-02-01T00:00:00Z');

    const result = checkDueDateDeviation({
      accrual_date,
      billing_date,
    });

    expect(result).toEqual({
      hasDeviation: true,
      deviationDays: 1,
      category: 'MONTH_END_BOUNDARY',
      warningLevel: 'INFO',
    });
  });
});