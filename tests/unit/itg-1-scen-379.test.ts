import { displayPurchaseHistory } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  test('SCEN-379: 対象期間の開始日がNullの場合、エラーが発生する', () => {
    const customerId = 'CUST-001';
    const periodStartDate = null;
    const periodEndDate = new Date('2024-12-31T23:59:59Z');

    expect(() => {
      displayPurchaseHistory({
        customerId,
        periodStartDate,
        periodEndDate,
      });
    }).toThrow(/対象期間の開始日/);
  });
});