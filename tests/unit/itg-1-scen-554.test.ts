import { detectUnbilledAndDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-554: 複数件の未請求案件がある場合、重複排除されて返される', () => {
    // Arrange: テストデータ準備
    const testDeals = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-100',
        dealStatus: '契約済み',
        dealAmount: 500000,
        invoiceIssuanceStatus: '未請求',
        invoiceIssuanceDate: null,
        expectedBillingDate: new Date('2024-01-31'),
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-100',
        dealStatus: '契約済み',
        dealAmount: 300000,
        invoiceIssuanceStatus: '未請求',
        invoiceIssuanceDate: null,
        expectedBillingDate: new Date('2024-01-31'),
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-100',
        dealStatus: '契約済み',
        dealAmount: 200000,
        invoiceIssuanceStatus: '未請求',
        invoiceIssuanceDate: null,
        expectedBillingDate: new Date('2024-01-31'),
      },
    ];

    // Act: 商談ステータスと請求書発行状況の自動照合・ズレ検出機能を実行
    const result = detectUnbilledAndDelayedDeals(testDeals);

    // Assert: 未請求案件が重複排除されて返される
    expect(result.unbilledDeals).toHaveLength(3);
    expect(result.unbilledDeals.map((deal) => deal.dealId)).toEqual([
      'DEAL-001',
      'DEAL-002',
      'DEAL-003',
    ]);

    // 各案件が一意であることを確認
    const dealIdSet = new Set(result.unbilledDeals.map((deal) => deal.dealId));
    expect(dealIdSet.size).toBe(3);

    // すべての案件が未請求ステータスであることを確認
    result.unbilledDeals.forEach((deal) => {
      expect(deal.invoiceIssuanceStatus).toBe('未請求');
      expect(deal.invoiceIssuanceDate).toBeNull();
    });

    // 期待される金額合計を検証（500000 + 300000 + 200000 = 1000000）
    const totalAmount = result.unbilledDeals.reduce(
      (sum, deal) => sum + deal.dealAmount,
      0,
    );
    expect(totalAmount).toBe(1000000);

    // 遅延案件がないことを確認
    expect(result.delayedDeals).toHaveLength(0);
  });
});