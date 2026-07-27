import { detectDateDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-638
  test('商談クローズ日と請求書発行日が同じ月の末日をまたぐとき、正確なズレ日数が計算される', () => {
    const deal = {
      dealName: 'Test Deal',
      closeDate: new Date('2024-01-31T00:00:00Z'),
      status: '受注',
    };

    const invoice = {
      invoiceNumber: 'INV-001',
      issueDate: new Date('2024-02-01T00:00:00Z'),
    };

    const result = detectDateDiscrepancy(deal, invoice);

    expect(result.discrepancyDays).toBe(1);
    expect(result.hasDiscrepancy).toBe(true);
    expect(result.dealCloseDate).toEqual(new Date('2024-01-31T00:00:00Z'));
    expect(result.invoiceIssueDate).toEqual(new Date('2024-02-01T00:00:00Z'));
  });
});