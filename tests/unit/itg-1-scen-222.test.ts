import { detectDelayedInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-222: 請求日が売上計上予定日より30日以上遅延している案件が遅延案件として特定される', () => {
    // テストケース1: 36日の遅延 → 遅延案件として特定されるべき
    const dealCase1 = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealStatus: '受注',
      plannedRevenueRecognitionDate: new Date('2024-01-10T00:00:00Z'),
      invoiceIssuedDate: new Date('2024-02-15T00:00:00Z'),
      invoiceAmount: 1000000,
    };

    // テストケース2: 25日の遅延 → 遅延案件として分類されないべき
    const dealCase2 = {
      dealId: 'DEAL-002',
      customerId: 'CUST-002',
      dealStatus: '受注',
      plannedRevenueRecognitionDate: new Date('2024-03-01T00:00:00Z'),
      invoiceIssuedDate: new Date('2024-03-25T00:00:00Z'),
      invoiceAmount: 500000,
    };

    const deals = [dealCase1, dealCase2];

    // 照合処理を実行
    const result = detectDelayedInvoices(deals);

    // 遅延案件として特定される案件の確認
    expect(result.delayedDeals).toHaveLength(1);
    expect(result.delayedDeals[0].dealId).toBe('DEAL-001');
    expect(result.delayedDeals[0].delayDays).toBe(36);
    expect(result.delayedDeals[0].isDelayed).toBe(true);

    // 遅延案件として分類されない案件の確認
    const nonDelayedDeals = result.allDeals.filter(
      (d) => d.dealId === 'DEAL-002',
    );
    expect(nonDelayedDeals).toHaveLength(1);
    expect(nonDelayedDeals[0].delayDays).toBe(25);
    expect(nonDelayedDeals[0].isDelayed).toBe(false);

    // 遅延案件の詳細情報を確認
    const delayedDealDetail = result.delayedDeals[0];
    expect(delayedDealDetail.dealStatus).toBe('受注');
    expect(delayedDealDetail.plannedRevenueRecognitionDate).toEqual(
      new Date('2024-01-10T00:00:00Z'),
    );
    expect(delayedDealDetail.invoiceIssuedDate).toEqual(
      new Date('2024-02-15T00:00:00Z'),
    );
    expect(delayedDealDetail.invoiceAmount).toBe(1000000);

    // 遅延判定の閾値確認（30日以上が遅延）
    expect(result.delayedDeals[0].delayDays).toBeGreaterThanOrEqual(30);
  });
});