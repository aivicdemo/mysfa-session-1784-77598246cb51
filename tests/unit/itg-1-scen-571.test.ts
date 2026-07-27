import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-571
  test('請求予定日が本日より1日前の案件は遅延案件として判定される', () => {
    // Arrange
    const mockCurrentDate = new Date('2024-01-15T09:00:00Z');
    const testDeal = {
      dealId: 'DEAL-001',
      customerName: 'テスト太郎',
      expectedBillingDate: new Date('2024-01-14T00:00:00Z'),
      status: '受注',
    };

    // Act
    const result = detectDelayedDeals([testDeal], mockCurrentDate);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].dealId).toBe('DEAL-001');
    expect(result[0].isDelayed).toBe(true);
    expect(result[0].delayedReason).toBe(
      '請求予定日（2024年1月14日）が本日（2024年1月15日）より1日前であるため、遅延案件です'
    );
  });
});