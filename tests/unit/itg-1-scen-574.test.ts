import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書の自動照合・ズレ検出機能', () => {
  // SCEN-574
  test('請求予定日が記録されていない案件は遅延案件判定時に例外が発生する', () => {
    const dealWithMissingBillingScheduledDate = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      amount: 100000,
      contractDate: new Date('2024-01-15T00:00:00Z'),
      status: '契約済み',
      billingScheduledDate: null,
      invoiceIssuedDate: undefined,
    };

    expect(() =>
      detectDelayedDeals([dealWithMissingBillingScheduledDate])
    ).toThrow(/請求予定日/);
  });
});