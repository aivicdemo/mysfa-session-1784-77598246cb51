import { reconcileDealsWithInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-717
  test('ステータス照合ロジック - 商談ステータスと請求書発行状況を照合する際、未請求と遅延の2つの検出カテゴリが正しく分離される', () => {
    const testDeals = [
      {
        deal_id: 'DEAL-001',
        status: 'closed_won',
        invoice_status: 'not_issued',
        issue_date: null,
        due_date: '2023-12-15',
      },
      {
        deal_id: 'DEAL-002',
        status: 'closed_won',
        invoice_status: 'issued',
        issue_date: '2024-01-29',
        due_date: '2023-12-15',
      },
    ];

    const result = reconcileDealsWithInvoices(testDeals);

    expect(result.detectionResults).toBeDefined();
    expect(result.detectionResults.unpaid).toBeDefined();
    expect(result.detectionResults.delayed).toBeDefined();

    expect(result.detectionResults.unpaid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deal_id: 'DEAL-001',
        }),
      ])
    );

    expect(result.detectionResults.delayed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deal_id: 'DEAL-002',
        }),
      ])
    );

    const unpaidIds = result.detectionResults.unpaid.map((item: any) => item.deal_id);
    const delayedIds = result.detectionResults.delayed.map((item: any) => item.deal_id);

    expect(unpaidIds).toContain('DEAL-001');
    expect(delayedIds).toContain('DEAL-002');

    const allDetectedIds = [...unpaidIds, ...delayedIds];
    const uniqueIds = new Set(allDetectedIds);
    expect(uniqueIds.size).toBe(allDetectedIds.length);

    expect(result.detectionResults.unpaid.length).toBe(1);
    expect(result.detectionResults.delayed.length).toBe(1);
  });
});