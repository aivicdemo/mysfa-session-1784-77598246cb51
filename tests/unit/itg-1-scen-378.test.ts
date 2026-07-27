import { fetchPastPurchaseHistory } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  test('SCEN-378: 対象期間の開始日がnullの場合、バリデーションエラーをスロー', () => {
    const customerId = 'CUST-001';
    const startDate = null;
    const endDate = new Date('2024-01-31T23:59:59Z');

    expect(() => {
      fetchPastPurchaseHistory({
        customerId,
        startDate,
        endDate,
      });
    }).toThrow(/対象期間の開始日/);
  });
});