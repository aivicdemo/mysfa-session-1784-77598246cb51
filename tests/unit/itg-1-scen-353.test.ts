import { searchCustomerById } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-353
  test('顧客IDで完全一致する顧客レコードが1件抽出される', () => {
    const search_customer_id = 'CUST-001';
    const expected_customer_name = '株式会社テスト';
    const expected_email = 'contact@test-company.jp';
    const expected_phone = '03-1234-5678';
    const expected_address = '東京都渋谷区テスト1-1-1';
    const expected_registered_at = '2024-01-15T09:30:00Z';

    const result = searchCustomerById(search_customer_id);

    expect(result).toEqual({
      customer_id: 'CUST-001',
      customer_name: expected_customer_name,
      email: expected_email,
      phone: expected_phone,
      address: expected_address,
      registered_at: expected_registered_at,
    });
    expect(Array.isArray(result) ? result.length : 1).toBe(1);
  });
});