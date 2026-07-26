import { filterPurchaseHistoryByPeriod } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-186
  test('過去購買履歴フィルタリング機能 - 対象期間内に購買履歴が存在しない場合、空の一覧が表示される', () => {
    const purchaseHistory = [
      {
        id: 'purchase_001',
        customerId: 'cust_001',
        purchaseDate: new Date('2021-06-15T10:00:00Z'),
        amount: 50000,
      },
      {
        id: 'purchase_002',
        customerId: 'cust_001',
        purchaseDate: new Date('2021-08-20T14:30:00Z'),
        amount: 75000,
      },
    ];

    const filterStartDate = new Date('2020-01-01T00:00:00Z');
    const filterEndDate = new Date('2020-01-31T23:59:59Z');

    const result = filterPurchaseHistoryByPeriod(
      purchaseHistory,
      filterStartDate,
      filterEndDate
    );

    expect(result).toEqual({
      filteredItems: [],
      message: '該当するデータがありません',
      count: 0,
    });
    expect(result.filteredItems.length).toBe(0);
    expect(result.count).toBe(0);
  });
});