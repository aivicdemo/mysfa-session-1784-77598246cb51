import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-563
  test('商談ステータスが「完了」で請求書発行日が記録されている場合、遅延案件判定の対象となる', () => {
    const deals = [
      {
        dealId: 'DEAL-001',
        dealName: 'テスト商談',
        status: '完了',
        invoiceIssuedDate: '2024-01-15',
        expectedBillingDate: '2024-01-10',
      },
      {
        dealId: 'DEAL-002',
        dealName: '未請求商談',
        status: '受注',
        invoiceIssuedDate: null,
        expectedBillingDate: '2024-01-12',
      },
      {
        dealId: 'DEAL-003',
        dealName: '期日内商談',
        status: '完了',
        invoiceIssuedDate: '2024-01-10',
        expectedBillingDate: '2024-01-15',
      },
    ];

    const result = detectDelayedDeals(deals);

    expect(result).toEqual({
      delayedDeals: [
        {
          dealId: 'DEAL-001',
          dealName: 'テスト商談',
          status: '完了',
          invoiceIssuedDate: '2024-01-15',
          expectedBillingDate: '2024-01-10',
          isDelayed: true,
          delayDays: 5,
        },
      ],
      unBilledDeals: [],
    });
  });
});