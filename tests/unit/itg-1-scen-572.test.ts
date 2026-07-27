import { detectDelayedInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-572
  test('請求予定日が本日より1日後の案件は遅延案件として判定されない', () => {
    // 固定日時: 本日 2024年1月15日 10:00:00
    const today = new Date('2024-01-15T10:00:00Z');
    const mockCurrentDate = today;

    // 請求予定日が本日より1日後（2024年1月16日）の商談を作成
    const dealRecords = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        dealStatus: '請求待ち',
        amount: 500000,
        invoiceScheduledDate: new Date('2024-01-16T00:00:00Z'),
        invoiceIssuedDate: null,
      },
    ];

    // 遅延案件検出ロジックを実行
    const result = detectDelayedInvoices(dealRecords, mockCurrentDate);

    // 期待結果: 該当案件は遅延案件リストに含まれない（配列が空）
    expect(result.delayedInvoices).toEqual([]);
    expect(result.normalInvoices).toContainEqual(
      expect.objectContaining({
        dealId: 'DEAL-001',
      })
    );
  });
});