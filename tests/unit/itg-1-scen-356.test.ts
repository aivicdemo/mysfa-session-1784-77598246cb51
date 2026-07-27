import { searchCustomers } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-356: [edge] 顧客検索機能 - 顧客名が空文字列で検索された場合、空の一覧が返される
  test('顧客名が空文字列で検索された場合、空の一覧が返される', () => {
    const searchQuery = '';
    const result = searchCustomers(searchQuery);

    expect(result).toEqual({
      customers: [],
      totalCount: 0,
      message: '検索結果：0件'
    });
  });
});