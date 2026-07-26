import { detectBillingMismatch } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-134: 売上計上予定日と実際の請求日が異なる場合に未請求案件として検出される
  test('売上計上予定日と実請求日のズレが検出される', () => {
    // Arrange: テストデータの準備
    const dealRecord = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      customerName: '株式会社テスト商社',
      dealStatus: '成約済み',
      dealAmount: 1500000,
      plannedBillingDate: new Date('2024-01-15T00:00:00Z'),
      actualBillingDate: new Date('2024-01-20T00:00:00Z'),
      invoiceNumber: 'INV-20240120-001',
      invoiceAmount: 1500000,
    };

    // Act: ズレ検出機能を実行
    const mismatchResult = detectBillingMismatch(dealRecord);

    // Assert: ズレが正しく検出されることを確認
    expect(mismatchResult).toBeDefined();
    expect(mismatchResult.hasMismatch).toBe(true);
    expect(mismatchResult.mismatchDays).toBe(5);
    expect(mismatchResult.mismatchType).toBe('未請求案件');
    expect(mismatchResult.dealId).toBe('DEAL-001');
    expect(mismatchResult.customerName).toBe('株式会社テスト商社');
    expect(mismatchResult.plannedDate).toEqual(new Date('2024-01-15T00:00:00Z'));
    expect(mismatchResult.actualDate).toEqual(new Date('2024-01-20T00:00:00Z'));
    expect(mismatchResult.delayDescription).toBe('5日の遅延');
    expect(mismatchResult.severityLevel).toBe('error');
    expect(mismatchResult.invoiceNumber).toBe('INV-20240120-001');
    expect(mismatchResult.dealStatus).toBe('成約済み');
  });
});