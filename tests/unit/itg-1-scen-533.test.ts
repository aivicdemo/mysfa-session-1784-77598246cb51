import { detectBillingDateDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-533
  test('日付ズレが業務上の許容範囲を超えているとき、警告ズレとして検出される', () => {
    const dealRecord = {
      dealId: 'test-deal-533',
      dealName: 'テスト商談-533',
      customerId: 'cust-a',
      customerName: 'テスト顧客A',
      dealStatus: '成約',
      closedDate: new Date('2024-01-15T00:00:00Z'),
    };

    const invoiceRecord = {
      invoiceId: 'INV-20240130',
      invoiceNumber: 'INV-20240130',
      issuedDate: new Date('2024-01-30T00:00:00Z'),
      invoiceStatus: '発行済み',
      amount: 100000,
    };

    const toleranceConfig = {
      maxToleranceDays: 7,
    };

    const result = detectBillingDateDiscrepancy(
      dealRecord,
      invoiceRecord,
      toleranceConfig
    );

    const expectedDiscrepancyDays = 15;

    expect(result.hasDiscrepancy).toBe(true);
    expect(result.discrepancyType).toBe('日付ズレ_許容超過');
    expect(result.discrepancyDays).toBe(expectedDiscrepancyDays);
    expect(result.warningMessage).toMatch(/警告.*成約.*2024年1月15日.*2024年1月30日.*7日.*15日/);
    expect(result.warningId).toMatch(/^WARN-\d{8}-\d{3}$/);
    expect(result.status).toBe('未対応');
    expect(result.detectedAt).toBeTruthy();
    expect(typeof result.detectedAt).toBe('string');
  });
});