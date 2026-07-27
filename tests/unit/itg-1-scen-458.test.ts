import { fetchCustomerRecordHistory } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  test('SCEN-458: 顧客IDが空文字列の場合、エラーが発生する', () => {
    const emptyCustomerId = '';

    expect(() => {
      fetchCustomerRecordHistory(emptyCustomerId);
    }).toThrow(/顧客ID/);
  });
});