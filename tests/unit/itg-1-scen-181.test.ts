import { searchCustomerRecords } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-181
  test('検索フィールドに空文字列を入力した場合、エラーが発生する', () => {
    const searchQuery = '';
    expect(() => searchCustomerRecords(searchQuery)).toThrow(/検索条件/);
  });
});