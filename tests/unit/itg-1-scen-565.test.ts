import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-565
  test('商談ステータスが「完了」でも請求書発行日が未記録の場合、遅延案件判定の対象外となる', () => {
    const testDeal = {
      dealId: 'DEAL-565-001',
      customerName: 'テスト顧客A',
      dealStatus: '完了',
      dealAmount: 100000,
      completionDate: '2024-01-15',
    };

    const testInvoice = {
      invoiceId: 'INV-565-001',
      dealId: 'DEAL-565-001',
      invoiceIssuedDate: null,
      invoiceStatus: '未発行',
    };

    const deals = [testDeal];
    const invoices = [testInvoice];

    const delayedDealsResult = detectDelayedDeals(deals, invoices);

    expect(delayedDealsResult).toEqual([]);
    expect(delayedDealsResult.length).toBe(0);
  });
});