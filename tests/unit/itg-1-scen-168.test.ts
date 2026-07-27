import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-168
  test('顧客別商談進捗集計機能 - 提案中ステータスの商談件数が0件のとき、その件数が0として集計される', () => {
    const customerId = 'CUST_001';
    const customerName = 'テスト顧客A';
    
    const dealData = [
      {
        dealId: 'DEAL_001',
        customerId: customerId,
        dealName: '商談1',
        status: '初期接触',
        amount: 100000,
      },
      {
        dealId: 'DEAL_002',
        customerId: customerId,
        dealName: '商談2',
        status: 'ヒアリング',
        amount: 200000,
      },
      {
        dealId: 'DEAL_003',
        customerId: customerId,
        dealName: '商談3',
        status: 'クローズ',
        amount: 150000,
      },
    ];

    const activityData: any[] = [];
    const periodStart = new Date('2024-01-01');
    const periodEnd = new Date('2024-01-31');

    const result = aggregateDealProgressByCustomer(
      dealData,
      activityData,
      periodStart,
      periodEnd
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      customerId: customerId,
      customerName: customerName,
      progressByStatus: {
        '初期接触': {
          count: 1,
          totalAmount: 100000,
        },
        'ヒアリング': {
          count: 1,
          totalAmount: 200000,
        },
        '提案中': {
          count: 0,
          totalAmount: 0,
        },
        '交渉中': {
          count: 0,
          totalAmount: 0,
        },
        '受注': {
          count: 0,
          totalAmount: 0,
        },
        '失注': {
          count: 0,
          totalAmount: 0,
        },
        'クローズ': {
          count: 1,
          totalAmount: 150000,
        },
      },
      totalDealCount: 3,
      totalAmount: 450000,
    });
  });
});