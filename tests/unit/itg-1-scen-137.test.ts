import { detectBillingDelayAndAddWarningFlag } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-137
  test('未請求・遅延案件の自動フラグ付与 - 商談ステータス『受注』で請求遅延（予定日超過）の案件に警告フラグが自動付与される', () => {
    const today = new Date('2024-04-15T00:00:00Z');
    const pastDate = new Date('2024-04-10T00:00:00Z');

    const deal = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      customerName: 'テスト顧客株式会社',
      status: '受注',
      amount: 500000,
      billingScheduledDate: pastDate,
      billingActualDate: null,
      billingAmount: 0,
      isBillingOverdue: false,
      warningFlag: false,
      warningFlagReason: '',
    };

    const result = detectBillingDelayAndAddWarningFlag(deal, today);

    expect(result.dealId).toBe('DEAL-001');
    expect(result.status).toBe('受注');
    expect(result.billingScheduledDate).toEqual(pastDate);
    expect(result.billingActualDate).toBeNull();
    expect(result.warningFlag).toBe(true);
    expect(result.warningFlagReason).toBe('billing_delay');
    expect(result.isBillingOverdue).toBe(true);
  });
});