import { aggregateMonthlySalesRevenue } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-129: 当月売上集計機能 - 商談金額が0円のものも売上合計に含まれる', () => {
    // テスト用データベース初期化
    const targetPeriod = {
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-31T23:59:59Z'),
    };

    // 当月の商談レコードデータ
    const deals = [
      {
        dealId: 'DEAL-A',
        amount: 100000,
        status: '成約',
        createdDate: new Date('2024-01-15T10:00:00Z'),
      },
      {
        dealId: 'DEAL-B',
        amount: 0,
        status: '成約',
        createdDate: new Date('2024-01-16T11:00:00Z'),
      },
      {
        dealId: 'DEAL-C',
        amount: 50000,
        status: '成約',
        createdDate: new Date('2024-01-17T12:00:00Z'),
      },
      {
        dealId: 'DEAL-D',
        amount: 0,
        status: '失注',
        createdDate: new Date('2024-01-18T13:00:00Z'),
      },
    ];

    // 当月売上集計機能を実行
    const result = aggregateMonthlySalesRevenue(deals, targetPeriod);

    // 期待値: 100,000 + 0 + 50,000 = 150,000円
    // 成約ステータスの0円商談（DEAL-B）は含まれ、失注ステータスの商談（DEAL-D）は除外される
    expect(result.totalRevenue).toBe(150000);
    expect(result.dealCount).toBe(3);
    expect(result.includedDeals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ dealId: 'DEAL-A', amount: 100000 }),
        expect.objectContaining({ dealId: 'DEAL-B', amount: 0 }),
        expect.objectContaining({ dealId: 'DEAL-C', amount: 50000 }),
      ])
    );
    expect(result.includedDeals).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ dealId: 'DEAL-D' })])
    );
  });
});