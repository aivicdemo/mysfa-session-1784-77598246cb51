import { searchCustomers } from '../../src/logic/it-1';

describe('顧客検索機能', () => {
  // SCEN-351: [normal] 顧客検索機能 - 顧客名で完全一致する顧客レコードが1件抽出される
  test('顧客名で完全一致する顧客レコードが1件抽出される', () => {
    const customers = [
      {
        customerId: 'C001',
        customerName: '株式会社ABC',
        address: '東京都渋谷区',
      },
      {
        customerId: 'C002',
        customerName: '株式会社DEF',
        address: '大阪府大阪市',
      },
    ];

    const searchCondition = '株式会社ABC';

    const result = searchCustomers(customers, searchCondition);

    expect(result.count).toBe(1);
    expect(result.records).toEqual([
      {
        customerId: 'C001',
        customerName: '株式会社ABC',
        address: '東京都渋谷区',
      },
    ]);
  });
});