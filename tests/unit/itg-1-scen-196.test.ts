import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-196: [error] 商談ステータス遷移の業務ルール検証機能 - 月次決算時の商談ステータスと請求データの照合検証に失敗したとき、該当ステータスが固定される
  test('月次決算時の照合検証に失敗した商談のステータスは固定され、ステータス遷移が拒否される', () => {
    const deal_001 = {
      dealId: 'DEAL-001',
      customerId: 'CUST-A',
      status: '提案中',
      amount: 500000,
      invoiceIssuedDate: null,
      invoiceAmount: null,
    };

    const deal_002 = {
      dealId: 'DEAL-002',
      customerId: 'CUST-B',
      status: '受注',
      amount: 800000,
      invoiceIssuedDate: '2024-04-15',
      invoiceAmount: 800000,
    };

    const deal_003 = {
      dealId: 'DEAL-003',
      customerId: 'CUST-C',
      status: '受注',
      amount: 1200000,
      invoiceIssuedDate: null,
      invoiceAmount: null,
    };

    const deal_004 = {
      dealId: 'DEAL-004',
      customerId: 'CUST-D',
      status: '交渉中',
      amount: 600000,
      invoiceIssuedDate: '2024-04-10',
      invoiceAmount: 500000,
    };

    const billingPeriodStart = '2024-04-01';
    const billingPeriodEnd = '2024-04-30';
    const currentDate = '2024-05-03';

    const deals = [deal_001, deal_002, deal_003, deal_004];

    const result = validateDealStatusTransition(
      deals,
      billingPeriodStart,
      billingPeriodEnd,
      currentDate
    );

    expect(result.validationPassed).toBe(false);
    expect(result.failedDeals).toHaveLength(2);

    const failedDealIds = result.failedDeals.map((d: { dealId: string }) => d.dealId);
    expect(failedDealIds).toContain('DEAL-003');
    expect(failedDealIds).toContain('DEAL-004');

    const deal_003_failure = result.failedDeals.find(
      (d: { dealId: string }) => d.dealId === 'DEAL-003'
    );
    expect(deal_003_failure.failureReason).toBe('未請求案件');
    expect(deal_003_failure.statusFrozen).toBe(true);
    expect(deal_003_failure.frozenStatus).toBe('受注');

    const deal_004_failure = result.failedDeals.find(
      (d: { dealId: string }) => d.dealId === 'DEAL-004'
    );
    expect(deal_004_failure.failureReason).toBe('遅延案件');
    expect(deal_004_failure.statusFrozen).toBe(true);
    expect(deal_004_failure.frozenStatus).toBe('交渉中');

    const passedDealIds = result.passedDeals.map((d: { dealId: string }) => d.dealId);
    expect(passedDealIds).toContain('DEAL-001');
    expect(passedDealIds).toContain('DEAL-002');
    expect(passedDealIds).toHaveLength(2);

    expect(result.reportTimestamp).toBe(currentDate);
    expect(result.reportTimestamp).toBeTruthy();

    const attempt_transition_deal_003 = {
      dealId: 'DEAL-003',
      currentStatus: '受注',
      targetStatus: '完了',
      statusFrozen: true,
      frozenStatus: '受注',
    };

    expect(() =>
      validateDealStatusTransition(
        [attempt_transition_deal_003],
        billingPeriodStart,
        billingPeriodEnd,
        currentDate
      )
    ).toThrow(/固定/);

    const attempt_transition_deal_004 = {
      dealId: 'DEAL-004',
      currentStatus: '交渉中',
      targetStatus: '受注',
      statusFrozen: true,
      frozenStatus: '交渉中',
    };

    expect(() =>
      validateDealStatusTransition(
        [attempt_transition_deal_004],
        billingPeriodStart,
        billingPeriodEnd,
        currentDate
      )
    ).toThrow(/固定/);
  });
});