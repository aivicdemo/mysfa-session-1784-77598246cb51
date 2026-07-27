import { validatePurchaseHistoryDateRange } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  test('SCEN-382: 対象期間の開始日が終了日より後の場合、エラーが発生する', () => {
    const startDate = new Date('2025-03-01');
    const endDate = new Date('2025-01-01');

    expect(() => {
      validatePurchaseHistoryDateRange(startDate, endDate);
    }).toThrow(/開始日は終了日以前の日付を指定してください/);
  });
});