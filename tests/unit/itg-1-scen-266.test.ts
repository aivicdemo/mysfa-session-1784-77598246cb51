import { detectUnbilledAndDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-266
  test('請求実行タイミング到達日と請求予定日が同日の場合に未請求案件として正確に検出される', () => {
    // 準備: テスト用の案件データを構築
    const today = new Date('2024-04-15T00:00:00Z');
    const deals = [
      {
        id: 'deal-001',
        customerId: 'cust-001',
        customerName: '顧客A',
        status: '受注',
        amount: 100000,
        dealDate: new Date('2024-04-10T00:00:00Z'),
        billingExecutionDate: today,
        billingPlanDate: today,
        billingStatus: '未請求',
        invoiceIssuedDate: null,
      },
      {
        id: 'deal-002',
        customerId: 'cust-002',
        customerName: '顧客B',
        status: '受注',
        amount: 50000,
        dealDate: new Date('2024-04-08T00:00:00Z'),
        billingExecutionDate: today,
        billingPlanDate: new Date('2024-04-14T00:00:00Z'),
        billingStatus: '未請求',
        invoiceIssuedDate: null,
      },
      {
        id: 'deal-003',
        customerId: 'cust-003',
        customerName: '顧客C',
        status: '受注',
        amount: 75000,
        dealDate: new Date('2024-04-05T00:00:00Z'),
        billingExecutionDate: today,
        billingPlanDate: new Date('2024-04-16T00:00:00Z'),
        billingStatus: '未請求',
        invoiceIssuedDate: null,
      },
      {
        id: 'deal-004',
        customerId: 'cust-004',
        customerName: '顧客D',
        status: '受注',
        amount: 120000,
        dealDate: new Date('2024-04-12T00:00:00Z'),
        billingExecutionDate: today,
        billingPlanDate: today,
        billingStatus: '請求済み',
        invoiceIssuedDate: new Date('2024-04-15T10:00:00Z'),
      },
    ];

    // 実行: 未請求・遅延案件自動検出機能を実行
    const result = detectUnbilledAndDelayedDeals({
      deals,
      currentDate: today,
    });

    // 検証1: 同日の未請求案件が検出される
    expect(result.unbilledDeals).toHaveLength(1);
    expect(result.unbilledDeals[0].id).toBe('deal-001');
    expect(result.unbilledDeals[0].customerName).toBe('顧客A');
    expect(result.unbilledDeals[0].billingStatus).toBe('未請求');

    // 検証2: 同日の未請求案件の請求実行タイミング到達日と請求予定日が同じであることを確認
    const unbilledDeal = result.unbilledDeals[0];
    expect(unbilledDeal.billingExecutionDate.getTime()).toBe(
      unbilledDeal.billingPlanDate.getTime()
    );

    // 検証3: 異なる日付を持つ案件が誤検出されていないことを確認
    const detectedIds = result.unbilledDeals.map((d) => d.id);
    expect(detectedIds).not.toContain('deal-002');
    expect(detectedIds).not.toContain('deal-003');

    // 検証4: 請求済み案件が検出されていないことを確認
    expect(detectedIds).not.toContain('deal-004');

    // 検証5: 遅延案件検出ロジックの正確性（deal-002とdeal-003の確認）
    expect(result.delayedDeals).toHaveLength(1);
    expect(result.delayedDeals[0].id).toBe('deal-002');

    // 検証6: 検出結果の統計情報
    expect(result.summary.totalUnbilledCount).toBe(1);
    expect(result.summary.totalDelayedCount).toBe(1);
    expect(result.summary.totalUnbilledAmount).toBe(100000);
    expect(result.summary.totalDelayedAmount).toBe(50000);
  });
});