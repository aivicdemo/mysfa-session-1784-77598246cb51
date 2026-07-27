import { searchCustomers } from '../../src/logic/it-1';

describe('顧客レコード画面 - 過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-357
  test('顧客IDが空文字列で検索された場合、空の一覧が返される', () => {
    const searchCriteria = {
      customerId: '',
      customerName: undefined,
    };

    const result = searchCustomers(searchCriteria);

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });
});