import { formatDealHistoryTimeseries } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  // SCEN-406
  test('商談レコードの作成日時が不正な形式のとき、エラーが発生する', () => {
    const invalidDealRecord = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealName: 'テスト商談',
      createdAt: '2024-13-45 25:70:90',
      amount: 100000,
      status: 'initial_contact',
    };

    expect(() => formatDealHistoryTimeseries([invalidDealRecord])).toThrow(
      /createdAt/
    );
  });
});