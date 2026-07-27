import { fetchDealHistoryAndActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  test('SCEN-464: 現在の経過時刻が指定されていない場合、エラーが発生する', () => {
    const customerId = 'CUST_001';
    const currentTimestamp = null;

    expect(() => {
      fetchDealHistoryAndActivityRecords({
        customerId,
        currentTimestamp,
      });
    }).toThrow(/現在の経過時刻/);
  });
});