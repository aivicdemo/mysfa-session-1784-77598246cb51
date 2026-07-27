import { displayCustomerDealHistory } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-465
  test('現在の経過時刻が空文字列の場合、エラーが発生する', () => {
    const mockCustomerId = 'CUST-12345';
    const mockElapsedTime = '';
    const mockMaxRecords = 100;

    expect(() => {
      displayCustomerDealHistory({
        customerId: mockCustomerId,
        elapsedTime: mockElapsedTime,
        maxRecords: mockMaxRecords,
      });
    }).toThrow(/elapsedTime|経過時刻/);
  });
});