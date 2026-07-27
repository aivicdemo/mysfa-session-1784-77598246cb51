import { searchCustomers } from '../../src/logic/it-1';

describe('顧客検索機能 - 検索結果が0件の場合', () => {
  // SCEN-355
  test('検索条件に合致する顧客が0件のとき、空の一覧と「見つかりません」メッセージを返す', () => {
    const searchQuery = '存在しない顧客XYZ';
    
    const result = searchCustomers(searchQuery);
    
    expect(result.customers).toEqual([]);
    expect(result.customers.length).toBe(0);
    expect(result.message).toBe('検索条件に合致する顧客が見つかりません');
    expect(result.hasHeader).toBe(true);
    expect(result.totalCount).toBe(0);
  });
});