import { aggregateDealsProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-186: 顧客別商談進捗集計機能 - 交渉中ステータスの商談合計金額が0円のとき、その金額が0として集計される', () => {
    // 準備: テストデータの構築
    const customerId = 'CUST-001';
    const aggregationPeriod = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    // 交渉中ステータスの複数件の商談（すべて金額0円）
    const negotiatingDeals = [
      {
        dealId: 'DEAL-001',
        customerId: customerId,
        status: '交渉中',
        amount: 0,
        createdAt: new Date('2024-01-15'),
      },
      {
        dealId: 'DEAL-002',
        customerId: customerId,
        status: '交渉中',
        amount: 0,
        createdAt: new Date('2024-01-20'),
      },
      {
        dealId: 'DEAL-003',
        customerId: customerId,
        status: '交渉中',
        amount: 0,
        createdAt: new Date('2024-01-25'),
      },
    ];

    // 他のステータスの商談も含める（確認用）
    const otherStatusDeals = [
      {
        dealId: 'DEAL-004',
        customerId: customerId,
        status: '初期接触',
        amount: 100000,
        createdAt: new Date('2024-01-10'),
      },
      {
        dealId: 'DEAL-005',
        customerId: customerId,
        status: '受注',
        amount: 500000,
        createdAt: new Date('2024-01-28'),
      },
    ];

    const allDeals = [...negotiatingDeals, ...otherStatusDeals];

    // 実行: 集計機能を呼び出し
    const result = aggregateDealsProgressByCustomer(allDeals, aggregationPeriod);

    // 検証: 交渉中ステータスの合計金額が0円として正確に集計されていること
    const customerProgress = result.find((item) => item.customerId === customerId);
    expect(customerProgress).toBeDefined();

    const negotiatingProgress = customerProgress?.progressByStatus.find(
      (status) => status.status === '交渉中'
    );
    expect(negotiatingProgress).toBeDefined();
    expect(negotiatingProgress?.totalAmount).toBe(0);
    expect(negotiatingProgress?.dealCount).toBe(3);

    // 他のステータスが正常に集計されていることも確認
    const initialContactProgress = customerProgress?.progressByStatus.find(
      (status) => status.status === '初期接触'
    );
    expect(initialContactProgress?.totalAmount).toBe(100000);
    expect(initialContactProgress?.dealCount).toBe(1);

    const orderedProgress = customerProgress?.progressByStatus.find(
      (status) => status.status === '受注'
    );
    expect(orderedProgress?.totalAmount).toBe(500000);
    expect(orderedProgress?.dealCount).toBe(1);
  });
});