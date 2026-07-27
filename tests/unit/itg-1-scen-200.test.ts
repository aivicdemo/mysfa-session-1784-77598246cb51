import { aggregateDealsByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-200: 顧客別商談進捗集計機能 - 複数顧客の商談データが正確に分離される', () => {
    // Arrange: テストデータベースに以下の商談データを準備
    const dealData = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        stage: '提案中',
        amount: 500000,
        month: '2024-01',
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-001',
        stage: '提案中',
        amount: 300000,
        month: '2024-01',
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-001',
        stage: '交渉中',
        amount: 700000,
        month: '2024-01',
      },
      {
        dealId: 'DEAL-004',
        customerId: 'CUST-002',
        stage: '提案中',
        amount: 400000,
        month: '2024-01',
      },
      {
        dealId: 'DEAL-005',
        customerId: 'CUST-002',
        stage: '成約',
        amount: 1000000,
        month: '2024-01',
      },
      {
        dealId: 'DEAL-006',
        customerId: 'CUST-003',
        stage: '交渉中',
        amount: 600000,
        month: '2024-01',
      },
    ];

    const targetMonth = '2024-01';

    // Act: 顧客別商談進捗集計機能を呼び出し、集計対象期間を当月とする
    const result = aggregateDealsByCustomer(dealData, targetMonth);

    // Assert: 戻り値のレスポンスデータを検証
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);

    // 顧客IDごとのグループ分けが正確に実行されているか確認
    const customerIds = result.map((r) => r.customerId).sort();
    expect(customerIds).toEqual(['CUST-001', 'CUST-002', 'CUST-003']);

    // 顧客A（CUST-001）の集計結果を確認
    const custAResult = result.find((r) => r.customerId === 'CUST-001');
    expect(custAResult).toBeDefined();
    expect(custAResult?.dealCount).toBe(3);
    expect(custAResult?.stageBreakdown).toEqual({
      '提案中': 2,
      '交渉中': 1,
    });

    // 顧客B（CUST-002）の集計結果を確認
    const custBResult = result.find((r) => r.customerId === 'CUST-002');
    expect(custBResult).toBeDefined();
    expect(custBResult?.dealCount).toBe(2);
    expect(custBResult?.stageBreakdown).toEqual({
      '提案中': 1,
      '成約': 1,
    });

    // 顧客C（CUST-003）の集計結果を確認
    const custCResult = result.find((r) => r.customerId === 'CUST-003');
    expect(custCResult).toBeDefined();
    expect(custCResult?.dealCount).toBe(1);
    expect(custCResult?.stageBreakdown).toEqual({
      '交渉中': 1,
    });

    // 各顧客グループ内で重複データがないこと（重複排除）を確認
    const totalDealCount = result.reduce((sum, r) => sum + r.dealCount, 0);
    expect(totalDealCount).toBe(6);

    // 顧客間でデータが混在していないこと（顧客Aの商談が顧客Bの集計に含まれていないなど）を確認
    const custAStages = Object.keys(custAResult?.stageBreakdown || {}).sort();
    const custBStages = Object.keys(custBResult?.stageBreakdown || {}).sort();
    const custCStages = Object.keys(custCResult?.stageBreakdown || {}).sort();

    expect(custAStages).not.toContain('成約');
    expect(custBStages).not.toContain('交渉中');
    expect(custCStages).not.toContain('提案中');
  });
});