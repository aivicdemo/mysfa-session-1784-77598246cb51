import { searchCustomersByPermission } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-165
  test('営業権限による顧客検索フィルタリング機能 - 権限情報が欠落または無効な場合にエラーが発生する', () => {
    const user_id = 'USR_001';
    const search_keyword = '顧客A';
    const permission_info = null;

    expect(() =>
      searchCustomersByPermission(user_id, search_keyword, permission_info)
    ).toThrow(/ユーザー権限/);
  });
});